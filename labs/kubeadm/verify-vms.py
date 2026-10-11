#!/usr/bin/env python3
"""Disposable, local QEMU VMs. Requires a verified Ubuntu 24.04 cloud image.
No host sudo, TAP interface, system package installation, or host mount is used.
Only state files/VMs under --directory are managed. Credentials never enter reports.
"""
import argparse, concurrent.futures, hashlib, json, os, pathlib, shlex, signal, subprocess, time

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('action',choices=['start','status','verify','stop'])
parser.add_argument('--directory',default='/tmp/kubelab-vm-run')
parser.add_argument('--tools',default='/tmp/kubelab-vm-tools')
parser.add_argument('--image-sha256',required=True)
parser.add_argument('--allow-tcg',action='store_true',help='Allow slow software CPU emulation when KVM is unavailable')
args=parser.parse_args()
root=pathlib.Path(args.directory).resolve(); tools=pathlib.Path(args.tools).resolve()
root.mkdir(parents=True,exist_ok=True)
env={**os.environ,'LD_LIBRARY_PATH':str(tools/'usr/lib/x86_64-linux-gnu'),'QEMU_MODULE_DIR':str(tools/'usr/lib/x86_64-linux-gnu/qemu')}
repo=pathlib.Path(__file__).resolve().parents[2]
names=['control-01','worker-01','worker-02']

def run(cmd,**kwargs):
 return subprocess.run([str(x) for x in cmd],text=True,capture_output=True,check=True,env=env,**kwargs)

def remote(index,script,timeout=900):
 cmd=['ssh','-i',str(root/'id_ed25519'),'-p',str(22220+index),'-o','BatchMode=yes','-o','ConnectTimeout=5','-o','StrictHostKeyChecking=accept-new','-o','UserKnownHostsFile='+str(root/'known_hosts'),'ubuntu@127.0.0.1','bash -se']
 return run(cmd,input=script,timeout=timeout).stdout

def alive(index):
 pidfile=root/names[index]/'qemu.pid'
 if not pidfile.exists():return False
 try:
  pid=int(pidfile.read_text());command=pathlib.Path('/proc')/str(pid)/'cmdline'
  return command.exists() and str(root/names[index]/'disk.qcow2').encode() in command.read_bytes()
 except (ValueError,OSError):return False

def status():
 for i,name in enumerate(names):
  try:detail=remote(i,'hostname; test -f /var/lib/cloud/instance/boot-finished && echo cloud-init-complete',timeout=10).strip()
  except Exception:detail='SSH not ready'
  print(name, 'running' if alive(i) else 'stopped', detail,flush=True)

if args.action=='start':
 image=root/'ubuntu-24.04.img';digest=hashlib.sha256()
 with image.open('rb') as f:
  for chunk in iter(lambda:f.read(1024*1024),b''):digest.update(chunk)
 if digest.hexdigest()!=args.image_sha256:raise SystemExit('Image checksum does not match; refusing to boot.')
 if any(alive(i) for i in range(3)):raise SystemExit('Existing test VMs are running. Use status or stop first.')
 if any((root/name/'disk.qcow2').exists() for name in names):raise SystemExit('Existing disks found. Use a new dedicated directory for a fresh run; no disks are overwritten.')
 accelerated=os.access('/dev/kvm',os.R_OK|os.W_OK)
 if not accelerated and not args.allow_tcg:raise SystemExit('KVM is inaccessible. Grant access or explicitly use --allow-tcg.')
 if not (root/'id_ed25519').exists():run(['ssh-keygen','-q','-t','ed25519','-N','','-C','kubelab-disposable-test','-f',root/'id_ed25519'])
 public_key=(root/'id_ed25519.pub').read_text().strip()
 for i,name in enumerate(names):
  folder=root/name;folder.mkdir(exist_ok=True)
  user_data={'hostname':name,'manage_etc_hosts':True,'ssh_pwauth':False,'users':[{'name':'ubuntu','groups':'sudo','shell':'/bin/bash','sudo':'ALL=(ALL) NOPASSWD:ALL','ssh_authorized_keys':[public_key]}]}
  (folder/'user-data').write_text('#cloud-config\n'+json.dumps(user_data))
  (folder/'meta-data').write_text(json.dumps({'instance-id':'kubelab-v02-'+name,'local-hostname':name}))
  network={'version':2,'ethernets':{'wan':{'match':{'macaddress':f'52:54:00:aa:{i:02x}:01'},'set-name':'wan0','dhcp4':True},'lab':{'match':{'macaddress':f'52:54:00:aa:{i:02x}:02'},'set-name':'lab0','addresses':[f'192.168.56.{10+i}/24']}}}
  (folder/'network-config').write_text(json.dumps(network))
  run([tools/'usr/bin/genisoimage','-output',folder/'seed.iso','-volid','cidata','-joliet','-rock',folder/'user-data',folder/'meta-data',folder/'network-config'])
  run([tools/'usr/bin/qemu-img','create','-f','qcow2','-F','qcow2','-b',image,folder/'disk.qcow2','20G'])
  command=[tools/'usr/bin/qemu-system-x86_64','-name','kubelab-'+name,'-machine','q35','-accel','kvm' if accelerated else 'tcg,thread=multi','-cpu','host' if accelerated else 'max','-smp','2','-m','4096' if i==0 else '2048','-L',tools/'usr/share/qemu','-bios',tools/'usr/share/seabios/bios-256k.bin','-display','none','-vga','none','-serial','file:'+str(folder/'serial.log'),'-monitor','none','-daemonize','-pidfile',folder/'qemu.pid','-drive',f'file={folder}/disk.qcow2,if=virtio,format=qcow2','-drive',f'file={folder}/seed.iso,if=virtio,format=raw,readonly=on','-netdev',f'user,id=wan,hostfwd=tcp:127.0.0.1:{22220+i}-:22','-device',f'virtio-net-pci,netdev=wan,mac=52:54:00:aa:{i:02x}:01,romfile=','-netdev','socket,id=lab,mcast=230.0.0.1:22345,localaddr=127.0.0.1','-device',f'virtio-net-pci,netdev=lab,mac=52:54:00:aa:{i:02x}:02,romfile=']
  try:run(command)
  except subprocess.CalledProcessError as e:raise SystemExit(e.stderr)
  print('Started',name,'using','KVM' if accelerated else 'TCG',flush=True)
 (root/'run-metadata.json').write_text(json.dumps({'image_sha256':args.image_sha256,'started_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'acceleration':'KVM' if accelerated else 'TCG','nodes':names},indent=2))
elif args.action=='status':status()
elif args.action=='stop':
 for i,name in enumerate(names):
  if alive(i):os.kill(int((root/name/'qemu.pid').read_text()),signal.SIGTERM);print('Stopped',name)
elif args.action=='verify':
 report={'status':'running','checks':[],'metadata':json.loads((root/'run-metadata.json').read_text())}
 def record(name,details):
  report['checks'].append({'name':name,'result':'passed','details':details});(root/'report.json').write_text(json.dumps(report,indent=2));print('PASS:',name,flush=True)
 try:
  for i,name in enumerate(names):
   deadline=time.monotonic()+900
   while True:
    try:remote(i,'test -f /var/lib/cloud/instance/boot-finished',timeout=10);break
    except Exception:
     if time.monotonic()>deadline:raise RuntimeError('Cloud-init timeout for '+name)
     time.sleep(5)
  record('Three Ubuntu VMs booted',[remote(i,'hostname; uname -r; . /etc/os-release; echo "$PRETTY_NAME"').strip() for i in range(3)])
  steps=json.loads(run(['node',repo/'labs/kubeadm/export-steps.mjs']).stdout)
  def prepare(i):
   # Multi-NIC VMs require an explicit Kubernetes node IP. This is documented in the guide.
   setup='set -euo pipefail\n'+steps[1]['code']+'\n'+steps[2]['code']+'\n'+steps[3]['code']+f'\necho "KUBELET_EXTRA_ARGS=--node-ip=192.168.56.{10+i}" | sudo tee /etc/default/kubelet\n'
   output=remote(i,setup,timeout=1800);(root/names[i]/'prepare.log').write_text(output)
   return {'node':names[i],'runtime':remote(i,'containerd --version; kubeadm version -o short; sudo systemctl is-active containerd').strip()}
  with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:record('Guide steps 2–4 on all nodes',list(executor.map(prepare,range(3))))
  # kubeadm output includes a join token: do not persist it in published evidence.
  remote(0,steps[4]['code'],timeout=1200)
  record('Control Plane initialized from guide','kubeadm init completed; node and kube-system queries succeeded')
  remote(0,'set -euo pipefail\ncd /tmp\ncurl -fsSLO https://get.helm.sh/helm-v3.19.0-linux-amd64.tar.gz\ncurl -fsSLO https://get.helm.sh/helm-v3.19.0-linux-amd64.tar.gz.sha256sum\nsha256sum -c helm-v3.19.0-linux-amd64.tar.gz.sha256sum\ntar -xzf helm-v3.19.0-linux-amd64.tar.gz\nsudo install linux-amd64/helm /usr/local/bin/helm\n',timeout=300)
  cilium='\n'.join(line for line in steps[5]['code'].splitlines() if line.startswith('helm '))
  remote(0,cilium,timeout=600)
  join=remote(0,'sudo kubeadm token create --print-join-command').strip()
  with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:list(executor.map(lambda i:remote(i,'sudo '+join,timeout=900),[1,2]))
  remote(0,'kubectl wait --for=condition=Ready nodes --all --timeout=900s\nkubectl -n kube-system rollout status daemonset/cilium --timeout=900s\nkubectl -n kube-system rollout status deployment/coredns --timeout=900s',timeout=1800)
  nodes=json.loads(remote(0,'kubectl get nodes -o json'))
  assert len(nodes['items'])==3
  record('Three Ready nodes, Cilium and CoreDNS', [{'name':n['metadata']['name'],'version':n['status']['nodeInfo']['kubeletVersion']} for n in nodes['items']])
  remote(0,'kubectl create deployment hello-kubelab --image=nginx:1.28 --replicas=2\nkubectl rollout status deployment/hello-kubelab --timeout=600s',timeout=900)
  response=remote(0,"kubectl port-forward deployment/hello-kubelab 8080:80 >/tmp/kubelab-port-forward.log 2>&1 &\npf=$!\ntrap 'kill \"$pf\" 2>/dev/null || true' EXIT\nfor attempt in $(seq 1 30); do if curl -fsS http://127.0.0.1:8080 >/tmp/kubelab-response; then head -n 5 /tmp/kubelab-response; exit 0; fi; sleep 1; done\nexit 1",timeout=45)
  assert 'html' in response.lower();record('Two replicas and HTTP via port-forward','nginx HTML received from a real Pod')
  # A real cross-node request proves more than port-forward alone.
  remote(0,'kubectl expose deployment hello-kubelab --port=80\nkubectl run client --image=busybox:1.37 --restart=Never --command -- sleep 3600\nkubectl wait --for=condition=Ready pod/client --timeout=600s\nkubectl exec client -- wget -T 15 -qO- http://hello-kubelab',timeout=900)
  record('Service DNS and HTTP','Client Pod resolved and reached hello-kubelab Service')
  remote(0,'kubectl delete pod client\nkubectl delete service hello-kubelab\nkubectl delete deployment hello-kubelab')
  record('Workload cleanup','Test Pod, Service and Deployment deleted')
  report['status']='passed'
 except Exception as e:
  report['status']='failed';report['failure']=str(e) if not isinstance(e,subprocess.CalledProcessError) else 'Remote command failed; inspect private VM logs and reproduce using the guide.'
  print(report['failure'],flush=True)
  raise
 finally:
  report['finished_at']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());(root/'report.json').write_text(json.dumps(report,indent=2))

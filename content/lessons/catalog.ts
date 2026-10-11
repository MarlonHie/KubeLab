import foundation0 from "./linux-processes.json" with { type: "json" };
import foundation1 from "./linux-namespaces.json" with { type: "json" };
import foundation2 from "./linux-cgroups.json" with { type: "json" };
import foundation3 from "./linux-systemd.json" with { type: "json" };
import foundation4 from "./linux-networking.json" with { type: "json" };
import foundation5 from "./container-images.json" with { type: "json" };
import foundation6 from "./container-runtime.json" with { type: "json" };
import foundation7 from "./container-cri.json" with { type: "json" };
import foundation8 from "./container-lifecycle.json" with { type: "json" };
import lesson0 from "./linux.json" with { type: "json" };
import lesson1 from "./containers.json" with { type: "json" };
import lesson2 from "./cluster-basics.json" with { type: "json" };
import lesson3 from "./control-plane.json" with { type: "json" };
import lesson4 from "./api-lifecycle.json" with { type: "json" };
import lesson5 from "./etcd.json" with { type: "json" };
import lesson6 from "./controllers.json" with { type: "json" };
import lesson7 from "./scheduling.json" with { type: "json" };
import lesson8 from "./kubelet-runtime.json" with { type: "json" };
import lesson9 from "./apply-to-pod.json" with { type: "json" };
import lesson10 from "./component-failures.json" with { type: "json" };
import lesson11 from "./networking.json" with { type: "json" };
import lesson12 from "./cilium.json" with { type: "json" };
export const lessonDocuments = [
  lesson0,
  foundation0,
  foundation1,
  foundation2,
  foundation3,
  foundation4,

  lesson1,
  foundation5,
  foundation6,
  foundation7,
  foundation8,

  lesson2,
  lesson3,
  lesson4,
  lesson5,
  lesson6,
  lesson7,
  lesson8,
  lesson9,
  lesson10,
  lesson11,
  lesson12,
];

import ScenicObject from "./ScenicObject";
import { focusBlur } from "./sceneState.mjs";
import styles from "./scenic-hero.module.css";

export default function ScenicScene({ scene, depth, motion, interact, actionState }) {
  return <div className={styles.scenery}>
    {scene.layers.map((layer) => <div key={layer.id} className={styles.depth} data-depth={layer.id} style={{ zIndex: layer.order, "--depth-blur": `${scene.focus ? focusBlur(layer.id, depth, scene.focus.blur) : 0}px` }}>
      {layer.objects.map((object) => {
        const state = actionState(object);
        return <ScenicObject key={object.id} object={object} state={state} active={state.progress === 1} motion={motion} onInteract={interact} getState={actionState} />;
      })}
    </div>)}
  </div>;
}

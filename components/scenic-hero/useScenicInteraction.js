"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { advanceAction, flattenObjects } from "./sceneState.mjs";

// Configuration supplies behavior parameters and copy; no route-specific branches.
export default function useScenicInteraction(scene, completed, record) {
  const [depth, setDepth] = useState(scene.focus?.initial || "middle");
  const visitedDepths = useRef(new Set());
  const actionCounts = useRef({});
  const [actions, setActions] = useState({});
  const [notice, setNotice] = useState("");
  const definitions = useMemo(() => Object.fromEntries(scene.layers.flatMap((layer) => flattenObjects(layer.objects)).map((object) => [object.id, object.action])), [scene]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4200);
    return () => clearTimeout(timer);
  }, [notice]);

  const selectDepth = (id) => {
    const option = scene.focus?.options.find((item) => item.id === id);
    if (!option) return;
    setDepth(id);
    visitedDepths.current.add(id);
    setNotice(option.description);
    if (visitedDepths.current.size === scene.focus.options.length) record(scene.discoveryId);
  };

  const interact = (object) => {
    const action = object.action;
    if (!action) return;
    if (action.depth) { selectDepth(action.depth); return; }
    const stages = action.stages || 1;
    const previous = completed && action.restore ? stages : actionCounts.current[object.id] || 0;
    // A restored discovery is already complete. Reinspection must not restart
    // the uncover sequence or repeat its completion announcement.
    if (previous >= stages) {
      setNotice(action.doneLabel || action.done);
      return;
    }
    const count = advanceAction(previous, stages);
    actionCounts.current = { ...actionCounts.current, [object.id]: count };
    setActions(actionCounts.current);
    const done = count === stages;
    setNotice(done ? action.done : action.progress?.[count - 1] || action.label);
    if (done && action.discover) record(scene.discoveryId);
  };

  const actionState = (object) => {
    const sourceId = object.reveal?.action || object.id;
    const definition = definitions[sourceId];
    const stages = definition?.stages || 1;
    const count = completed && definition?.restore ? stages : actions[sourceId] || 0;
    return { progress: count / stages, label: count >= stages ? definition?.doneLabel : definition?.stageLabels?.[count] };
  };
  return { depth, selectDepth, interact, actionState, notice };
}

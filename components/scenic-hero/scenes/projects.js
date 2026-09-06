import { assets } from './projects-assets.js';
import { ambientObjects } from './ambientObjects.js';

export const projectsScene = {
  id: 'projects-desert', name: 'Stone desert', discoveryId: 'desert',
  copy: { tones: { morning: 'dark', noon: 'dark', sunset: 'dark', night: 'light' }, top: 'clamp(150px, 17vh, 220px)', inset: 'max(6vw, calc((100vw - 1040px) / 2))' },
  background: { ...assets['desert-1536'], medium: assets['desert-1280'].src, mobile: assets['desert-768'].src },
  layers: [
    { id: 'far', order: 1, objects: [
      { id: 'sandstone-arch', ...assets.arch, layout: { x: '62%', y: '12%', w: '46%' }, tablet: { x: '56%', y: '33%', w: '62%' }, mobile: { x: '45%', y: '51%', w: '92%' }, pivot: '50% 100%', parallax: -.25 },
    ] },
    { id: 'middle', order: 2, objects: [
      ...ambientObjects({ count: 7, material: 'dust', seed: 31, duration: 14, size: '3px', x: '90px', y: '-14px', area: { left: 45, top: 28, width: 48, height: 35 } }),
    ] },
    { id: 'near', order: 3, objects: [
      {
        id: 'foreground-sand', ...assets.sandbank,
        layout: { x: '-5%', y: '55%', w: '110%' }, tablet: { y: 'auto', b: '-20px' }, mobile: { x: '-55%', y: 'auto', b: '-20px', w: '200%' },
        pivot: '50% 100%', parallax: -.7,
        children: [
          {
            id: 'compass', ...assets.compass,
            layout: { x: '73%', y: '15%', w: '6%' }, mobile: { x: '55%', y: '-4%', w: '9%' },
            action: {
              label: 'Brush away the sand', stages: 3, discover: true, restore: true, pressed: true,
              stageLabels: ['Brush away the sand', 'Brush the compass rim', 'Uncover the compass needle'],
              progress: ['A brass rim appears beneath the sand.', 'The compass face catches the light.'],
              done: 'A compass, uncovered. The desert is added to your journal.', doneLabel: 'Inspect the uncovered compass',
            },
            response: { duration: 420, keyframes: [{ transform: 'rotate(0)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0)' }] },
            children: [{ id: 'covering-sand', ...assets['sand-cover'], layout: { x: '-20%', y: '7%', w: '140%' }, reveal: { action: 'compass', invert: true } }],
          },
          {
            id: 'desert-beetle', ...assets.beetle,
            layout: { x: '61%', y: '38%', w: '2.1%', r: '-8deg' }, mobile: { x: '47%', y: '33%', w: '4%' },
            motion: { type: 'float', duration: 21, x: '24px', y: '-3px' },
          },
        ],
      },
    ] },
  ],
};

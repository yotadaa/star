import { assets } from './research-assets.js';
import { ambientObjects } from './ambientObjects.js';

export const researchScene = {
  id: 'research-city', name: 'City after rain', discoveryId: 'city',
  copy: { tones: { morning: 'light', noon: 'light', sunset: 'light', night: 'light' }, top: 'clamp(160px, 19vh, 230px)', inset: 'max(6vw, calc((100vw - 1040px) / 2))' },
  background: { ...assets['city-1536'], medium: assets['city-1280'].src, mobile: assets['city-768'].src },
  atmosphere: {
    morning: { color: 'var(--palette-cream)', strength: 12 },
    noon: { color: 'var(--palette-cream)', strength: 0 },
    sunset: { color: 'var(--palette-coral-dark)', strength: 20 },
    night: { color: 'var(--palette-ink)', strength: 45 },
  },
  layers: [
    { id: 'far', order: 1, objects: [
      { id: 'middle-buildings', ...assets['middle-block'], layout: { x: '51%', y: 'auto', b: '18%', w: '38%' }, tablet: { x: '40%', b: '19%', w: '55%' }, mobile: { x: '4%', b: '12%', w: '110%' }, parallax: -.25 },
      { id: 'distant-vapor', ...assets.vapor, layout: { x: '48%', y: '60%', w: '43%' }, mobile: { x: '13%', y: '67%', w: '85%' }, parallax: -.2, motion: { type: 'drift', duration: 28, delay: -10, x: '-24px', y: '-8px' } },
      { id: 'distant-shuttle', ...assets.shuttle, layout: { x: '62%', y: '41%', w: '3.4%' }, tablet: { x: '61%', y: '48%' }, mobile: { x: '51%', y: '55%', w: '9%' }, parallax: -.2, motion: { type: 'drift', duration: 31, delay: -11, x: '-110px', y: '6px' } },
    ] },
    { id: 'middle', order: 2, objects: [
      { id: 'near-facade', ...assets.facade, layout: { x: '85%', y: 'auto', b: '12%', w: '22%' }, tablet: { x: '83%', b: '17%', w: '25%' }, mobile: { x: '75%', b: '18%', w: '36%' }, parallax: -.55 },
      { id: 'near-shuttle', ...assets.shuttle, layout: { x: '69%', y: '57%', w: '7%' }, tablet: { x: '62%', y: '60%', w: '9%' }, mobile: { x: '47%', y: '64%', w: '15%' }, parallax: -.45, motion: { type: 'drift', duration: 24, delay: -6, x: '-150px', y: '-9px' } },
      { id: 'near-vapor', ...assets.vapor, layout: { x: '68%', y: '73%', w: '27%' }, mobile: { x: '41%', y: '78%', w: '70%' }, parallax: -.5, motion: { type: 'drift', duration: 21, delay: -6, x: '-38px', y: '-15px' } },
      ...ambientObjects({ count: 8, material: 'rain', seed: 83, duration: 2.6, size: '1px', x: '-34px', y: '240px', area: { left: 18, top: 16, width: 77, height: 48 } }),
    ] },
    { id: 'near', order: 3, objects: [
      { id: 'wet-rooftop', ...assets.rooftop, layout: { x: '-4%', y: 'auto', b: '-1%', w: '108%' }, tablet: { x: '-25%', b: '-1%', w: '150%' }, mobile: { x: '-90%', b: '-1%', w: '270%' }, parallax: -.8,
        children: [
          { id: 'signal', ...assets.signal, layout: { x: '64%', y: '16%', w: '8%' }, tablet: { x: '50%', y: '-7%', w: '10%' }, mobile: { x: '55.5%', y: '-5%', w: '9.8%' },
            action: { label: 'Connect the rooftop receiver', stages: 1, discover: true, restore: true, pressed: true, done: 'Signal received. The city is added to your journal.', doneLabel: 'Inspect the connected receiver' },
            response: { duration: 900, keyframes: [{ opacity: 1 }, { opacity: .55, offset: .2 }, { opacity: 1, offset: .45 }, { opacity: .65, offset: .65 }, { opacity: 1 }] },
            children: [{ id: 'receiver-indicator', primitive: 'signal-light', layout: { x: '54%', y: '77%', w: '5%' }, reveal: { action: 'signal' } }],
          },
        ],
      },
    ] },
  ],
};

import { assets } from "./about-assets.js";

export const aboutScene = {
  id: "about-canopy",
  name: "Among the branches",
  discoveryId: "canopy",
  background: { ...assets["forest-1536"], medium: assets["forest-1280"].src, mobile: assets["forest-768"].src },
  breakout: { desktop: "96px", tablet: "64px", mobile: "40px", opacity: { morning: .96, noon: 1, sunset: .85, night: .55 } },
  focus: {
    initial: "middle",
    options: [
      { id: "near", label: "Near", description: "The nearby bark comes into focus; the branches behind it soften." },
      { id: "middle", label: "Middle", description: "Focus rests on the branch where the bird is perched." },
      { id: "far", label: "Far", description: "Focus shifts toward the leaves and light beyond." },
    ],
    blur: { near: { middle: 7, far: 9 }, middle: { near: 4, far: 4 }, far: { near: 9, middle: 6 } },
  },
  layers: [
    { id: "far", order: 1, objects: [
      { id: "canopy-light", primitive: "celestial", layout: { x: "86%", y: "10%", w: "3%" }, mobile: { x: "83%", y: "7%", w: "7%" }, parallax: -.1 },
      { id: "far-leaves", ...assets["foliage"], layout: { x: "67%", y: "-7%", w: "42%", r: "25deg" }, mobile: { x: "40%", y: "0%", w: "85%" }, pivot: "90% 85%", parallax: -.2, motion: { type: "sway", duration: 12, sway: ".6deg", delay: -4 } },
    ] },
    { id: "middle", order: 2, objects: [
      { id: "middle-branch", kind: "branch", ...assets["branch"], layout: { x: "52%", y: "41%", w: "63%", r: "-5deg" }, mobile: { x: "32%", y: "55%", w: "100%", r: "-8deg" }, pivot: "100% 50%", parallax: -.5, action: { label: "Focus on this branch", depth: "middle" }, children: [{ id: "bird", kind: "organism", ...assets["bird"], layout: { x: "29%", y: "32%", w: "9%", r: "5deg" }, mobile: { r: "8deg" }, parallax: 0, motion: { type: "visitor", duration: 29 }, action: { label: "Observe the bird", done: "The bird hops to a nearby perch, then settles again." }, response: { duration: 1100, keyframes: [{ transform: "translate(0,0)" }, { transform: "translate(30px,-28px)", offset: .36 }, { transform: "translate(45px,-5px)", offset: .65 }, { transform: "translate(0,0)" }] } }] },
      { id: "middle-leaves", ...assets["foliage"], layout: { x: "79%", y: "33%", w: "25%", r: "-14deg" }, mobile: { x: "72%", y: "43%", w: "52%" }, pivot: "90% 85%", parallax: -.55, motion: { type: "sway", duration: 8.5, sway: "1.1deg", delay: -2 } },
    ] },
    { id: "near", order: 3, foreground: true, maxBlur: 1.25, objects: [
      { id: "near-branch", kind: "branch", ...assets["branch"], layout: { x: "-18%", y: "auto", b: "-64px", w: "80%", r: "180deg" }, tablet: { b: "-44px" }, mobile: { x: "-54%", b: "-28px", w: "158%", r: "180deg" }, pivot: "50% 50%", parallax: -1, action: { label: "Focus on nearby bark", depth: "near", hitArea: { desktop: { x: "36%", y: "58%", w: "18%", h: "20%" } } }, children: [
        { id: "near-leaves", ...assets["foliage"], layout: { x: "43%", y: "8%", w: "32%", r: "-72deg" }, pivot: "100% 100%", parallax: 0, motion: { type: "sway", duration: 10.5, sway: ".9deg", delay: -6 } },
      ] },
    ] },
  ],
};

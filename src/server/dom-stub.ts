/** Node has no DOM. Headless play never paints; this only keeps a stray canvas alloc from throwing. */
if (typeof globalThis.document === "undefined") {
  const createElement = (): Record<string, unknown> => {
    const el: Record<string, unknown> = {
      width: 0,
      height: 0,
      style: {},
      hidden: true,
    };
    el.getContext = () => null;
    el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1280, height: 720, right: 1280, bottom: 720, x: 0, y: 0 });
    return el;
  };
  Object.assign(globalThis, {
    document: {
      createElement,
      body: { classList: { contains: () => false } },
    },
  });
}

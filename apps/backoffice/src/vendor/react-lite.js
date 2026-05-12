(function () {
  const Fragment = Symbol("Fragment");
  const unitlessStyles = new Set([
    "flex",
    "flexGrow",
    "flexShrink",
    "fontWeight",
    "lineHeight",
    "opacity",
    "order",
    "zIndex",
  ]);

  let rootNode = null;
  let rootComponent = null;
  let currentComponentKey = null;
  let hookIndex = 0;
  let hookBuckets = new Map();
  let effects = [];
  let rendering = false;

  function flatten(input, out = []) {
    if (Array.isArray(input)) {
      input.forEach((item) => flatten(item, out));
    } else if (input !== null && input !== undefined && input !== false && input !== true) {
      out.push(input);
    }
    return out;
  }

  function sameDeps(a, b) {
    return Boolean(a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i])));
  }

  function scheduleRender() {
    if (!rootNode || !rootComponent || rendering) return;
    queueMicrotask(renderRoot);
  }

  function currentHooks() {
    if (!currentComponentKey) {
      throw new Error("Hooks can only be used while rendering a component.");
    }

    let bucket = hookBuckets.get(currentComponentKey);
    if (!bucket) {
      bucket = [];
      hookBuckets.set(currentComponentKey, bucket);
    }
    return bucket;
  }

  function useState(initialValue) {
    const hooks = currentHooks();
    const index = hookIndex++;
    if (!(index in hooks)) {
      hooks[index] = typeof initialValue === "function" ? initialValue() : initialValue;
    }

    const setState = (nextValue) => {
      const value = typeof nextValue === "function" ? nextValue(hooks[index]) : nextValue;
      if (Object.is(value, hooks[index])) return;
      hooks[index] = value;
      scheduleRender();
    };

    return [hooks[index], setState];
  }

  function useMemo(factory, deps) {
    const hooks = currentHooks();
    const index = hookIndex++;
    const current = hooks[index];
    if (current && sameDeps(current.deps, deps)) return current.value;
    const value = factory();
    hooks[index] = { deps, value };
    return value;
  }

  function useCallback(callback, deps) {
    return useMemo(() => callback, deps);
  }

  function useRef(initialValue) {
    const hooks = currentHooks();
    const index = hookIndex++;
    if (!(index in hooks)) hooks[index] = { current: initialValue };
    return hooks[index];
  }

  function useEffect(effect, deps) {
    const hooks = currentHooks();
    const index = hookIndex++;
    const current = hooks[index];
    if (current && sameDeps(current.deps, deps)) return;
    hooks[index] = { deps, cleanup: current && current.cleanup };
    effects.push({ hooks, index, effect });
  }

  function createElement(type, props, ...children) {
    const nextProps = props ? { ...props } : {};
    if (children.length) nextProps.children = children.length === 1 ? children[0] : children;
    return { type, props: nextProps };
  }

  function jsxDEV(type, props) {
    return { type, props: props || {} };
  }

  function applyStyle(node, style) {
    if (!style) return;
    Object.entries(style).forEach(([name, value]) => {
      if (value === null || value === undefined) return;
      const cssValue = typeof value === "number" && !unitlessStyles.has(name) ? `${value}px` : String(value);
      node.style[name] = cssValue;
    });
  }

  function setProp(node, name, value) {
    if (name === "children" || name === "key") return;
    if (name === "className") {
      node.setAttribute("class", value || "");
      return;
    }
    if (name === "style") {
      applyStyle(node, value);
      return;
    }
    if (name.startsWith("on") && typeof value === "function") {
      const eventName = name.slice(2).toLowerCase();
      node.addEventListener(eventName, value);
      return;
    }
    if (value === false || value === null || value === undefined) return;
    if (value === true) {
      node.setAttribute(name, "");
      node[name] = true;
      return;
    }

    if (name in node) {
      try {
        node[name] = value;
      } catch {
        node.setAttribute(name, String(value));
      }
    } else {
      node.setAttribute(name, String(value));
    }
  }

  function renderElement(vnode, path = "0") {
    if (vnode === null || vnode === undefined || vnode === false || vnode === true) {
      return document.createTextNode("");
    }
    if (typeof vnode === "string" || typeof vnode === "number") {
      return document.createTextNode(String(vnode));
    }
    if (Array.isArray(vnode)) {
      const fragment = document.createDocumentFragment();
      flatten(vnode).forEach((child, index) => fragment.appendChild(renderElement(child, `${path}.${index}`)));
      return fragment;
    }
    if (vnode.type === Fragment) {
      const fragment = document.createDocumentFragment();
      flatten(vnode.props && vnode.props.children).forEach((child, index) => {
        fragment.appendChild(renderElement(child, `${path}.${index}`));
      });
      return fragment;
    }
    if (typeof vnode.type === "function") {
      const previousComponentKey = currentComponentKey;
      const previousHookIndex = hookIndex;
      currentComponentKey = `${path}:${vnode.type.name || "Component"}`;
      hookIndex = 0;
      const rendered = vnode.type(vnode.props || {});
      currentComponentKey = previousComponentKey;
      hookIndex = previousHookIndex;
      return renderElement(rendered, `${path}.r`);
    }

    const node = document.createElement(vnode.type);
    const props = vnode.props || {};
    Object.entries(props).forEach(([name, value]) => setProp(node, name, value));
    flatten(props.children).forEach((child, index) => node.appendChild(renderElement(child, `${path}.${index}`)));
    return node;
  }

  function runEffects() {
    const pending = effects;
    effects = [];
    pending.forEach(({ hooks, index, effect }) => {
      if (hooks[index] && typeof hooks[index].cleanup === "function") {
        hooks[index].cleanup();
      }
      const cleanup = effect();
      if (hooks[index]) hooks[index].cleanup = cleanup;
    });
  }

  function renderRoot() {
    if (!rootNode || !rootComponent) return;
    rendering = true;
    currentComponentKey = null;
    hookIndex = 0;
    effects = [];
    rootNode.replaceChildren(renderElement(rootComponent()));
    rendering = false;
    runEffects();
  }

  window.React = {
    Fragment,
    createElement,
    useState,
    useEffect,
    useMemo,
    useRef,
    useCallback,
  };

  window.ReactDOM = {
    createRoot(node) {
      rootNode = node;
      return {
        render(component) {
          rootComponent = typeof component.type === "function" ? () => component : () => component;
          renderRoot();
        },
      };
    },
  };

  window.jsxDEV_7x81h0kn = jsxDEV;
  window.Fragment_8vg9x3sq = Fragment;
})();

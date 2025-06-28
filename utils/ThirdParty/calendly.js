export const importCalendlyScript = () => {
  return new Promise((resolve, reject) => {
    const id = 'calendlyScript';
    const calendlyScript = document.getElementById(id);

    if (!calendlyScript) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.id = id;
      script.async = true;
      script.onload = resolve; // Resolve the promise when the script is loaded
      script.onerror = reject; // Reject the promise if there's an error loading the script
      document.body.appendChild(script);

      const css = document.createElement('link');
      css.href = 'https://assets.calendly.com/assets/external/widget.css';
      css.rel = 'stylesheet';
      css.id = `${id}Css`;
      document.body.appendChild(css);
    } else {
      resolve(); // Resolve immediately if the script is already present
    }
  });
};

export const removeCalendlyScript = () => {
  const script = document.getElementById('calendlyScript');
  const css = document.getElementById('calendlyScriptCss');
  if (script) {
    script.remove();
  }
  if (css) {
    css.remove();
  }
};

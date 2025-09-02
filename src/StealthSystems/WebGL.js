async function spoofWebGL(page, vendor = 'Intel Inc.', renderer = 'Intel Iris OpenGL Engine') {
  await page.evaluateOnNewDocument((vendor, renderer) => {
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (parameter === 37445) return vendor;
      if (parameter === 37446) return renderer;
      return getParameter.call(this, parameter);
    };
  }, vendor, renderer);
}

module.exports = spoofWebGL; 
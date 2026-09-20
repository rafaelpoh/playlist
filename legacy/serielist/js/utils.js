/**
 * utils.js
 * Funções utilitárias puras e reutilizáveis para o projeto.
 * Segue as regras do spec.md: Vanilla JS, sem frameworks.
 */

/* ==========================================================================
   DOM MANIPULATION
   ========================================================================== */

/**
 * Seleciona um único elemento do DOM.
 * @param {string} selector - Seletor CSS (ex: '#id', '.class').
 * @param {Element} [scope=document] - Elemento pai para buscar dentro (opcional).
 * @returns {Element|null}
 */
export const qs = (selector, scope = document) => {
  return scope.querySelector(selector);
};

/**
 * Seleciona múltiplos elementos do DOM.
 * @param {string} selector - Seletor CSS.
 * @param {Element} [scope=document] - Elemento pai (opcional).
 * @returns {NodeList}
 */
export const qsa = (selector, scope = document) => {
  return scope.querySelectorAll(selector);
};

/**
 * Adiciona um event listener a um elemento ou lista de elementos.
 * @param {Element|NodeList|string} target - Elemento(s) alvo ou seletor.
 * @param {string} type - Tipo do evento (ex: 'click').
 * @param {Function} callback - Função a ser executada.
 */
export const on = (target, type, callback) => {
  const elements = typeof target === "string" ? qsa(target) : target;

  if (elements instanceof NodeList) {
    elements.forEach((el) => el.addEventListener(type, callback));
  } else if (
    elements instanceof Element ||
    elements === window ||
    elements === document
  ) {
    elements.addEventListener(type, callback);
  }
};

/* ==========================================================================
   SECURITY & SANITIZATION (Spec Rule #4)
   ========================================================================== */

/**
 * Cria um elemento HTML de forma segura, evitando innerHTML.
 * @param {string} tag - Nome da tag (ex: 'div', 'button').
 * @param {Object} attributes - Objeto com atributos (ex: { class: 'btn', id: 'my-btn' }).
 * @param {string} text - Texto interno (será tratado como textContent para segurança).
 * @returns {Element} O elemento criado.
 */
export const createElement = (tag, attributes = {}, text = "") => {
  const element = document.createElement(tag);

  // Define atributos
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "class") {
      element.className = value;
    } else if (key === "dataset") {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });

  // Define texto seguro
  if (text) {
    element.textContent = text;
  }

  return element;
};

/**
 * Sanitiza uma string para evitar injeção de scripts simples ao renderizar.
 * Útil apenas se for ESTRITAMENTE necessário usar innerHTML (evite se puder).
 * @param {string} str - String suja.
 * @returns {string} String limpa.
 */
export const escapeHTML = (str) => {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

/* ==========================================================================
   FUNCTIONAL UTILS
   ========================================================================== */

/**
 * Debounce: Limita a frequência com que uma função é executada.
 * Útil para eventos de resize, scroll ou input.
 * @param {Function} func - Função a ser executada.
 * @param {number} wait - Tempo de espera em ms.
 * @returns {Function}
 */
export const debounce = (func, wait = 100) => {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Gera um ID único simples (útil para listas temporárias).
 * @returns {string}
 */
export const generateId = () => {
  return "_" + Math.random().toString(36).substr(2, 9);
};

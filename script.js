(function(){
  const $ = id => document.getElementById(id);
  const exprEl = $('expr');
  const valEl  = $('value');

  let current = '0';
  let previous = '';
  let operator = '';
  let resetNext = false;

  const opSymbols = {'/':'÷','*':'×','-':'−','+':'+'};

  function updateDisplay(){
    valEl.classList.remove('small','xsmall');
    if(current.length > 10) valEl.classList.add('xsmall');
    else if(current.length > 7) valEl.classList.add('small');

    valEl.textContent = current;

    if(previous && operator){
      exprEl.textContent = formatNum(previous) + ' ' + opSymbols[operator];
    } else {
      exprEl.textContent = '';
    }
  }

  function formatNum(n){
    const num = parseFloat(n);
    if(isNaN(num)) return n;
    if(n.endsWith('.')) return n;
    if(n.includes('.') && n.split('.')[1].length > 0){
      return n;
    }
    return num.toLocaleString('en-US',{maximumFractionDigits:10});
  }

  function inputNum(n){
    if(current === 'Error') current = '0';
    if(resetNext){
      current = n;
      resetNext = false;
    } else {
      if(current === '0' && n !== '0') current = n;
      else if(current === '0' && n === '0') return;
      else if(current.replace(/[^0-9]/g,'').length >= 12) return;
      else current += n;
    }
    updateDisplay();
  }

  function inputDecimal(){
    if(resetNext){ current = '0.'; resetNext = false; }
    else if(!current.includes('.')) current += '.';
    updateDisplay();
  }

  function inputOp(op){
    if(current === 'Error'){ clear(); return; }
    if(previous && operator && !resetNext){
      calculate();
    }
    previous = current;
    operator = op;
    resetNext = true;
    highlightOp(op);
    updateDisplay();
  }

  function calculate(){
    if(!operator || !previous) return;
    const a = parseFloat(previous);
    const b = parseFloat(current);
    let result;

    switch(operator){
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/':
        if(b === 0){
          current = 'Error';
          previous = '';
          operator = '';
          resetNext = true;
          valEl.classList.add('shake');
          setTimeout(()=> valEl.classList.remove('shake'),400);
          updateDisplay();
          return;
        }
        result = a / b;
        break;
    }

    result = parseFloat(result.toPrecision(12));
    current = String(result);
    exprEl.textContent = formatNum(previous) + ' ' + opSymbols[operator] + ' ' + formatNum(String(b)) + ' =';
    previous = '';
    operator = '';
    resetNext = true;
    clearOpHighlight();
    valEl.classList.remove('small','xsmall');
    if(current.length > 10) valEl.classList.add('xsmall');
    else if(current.length > 7) valEl.classList.add('small');
    valEl.textContent = current;
  }

  function clear(){
    current = '0';
    previous = '';
    operator = '';
    resetNext = false;
    clearOpHighlight();
    updateDisplay();
  }

  function toggleSign(){
    if(current === '0' || current === 'Error') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
    updateDisplay();
  }

  function percent(){
    if(current === 'Error') return;
    current = String(parseFloat(current) / 100);
    updateDisplay();
  }

  function highlightOp(op){
    clearOpHighlight();
    const btn = document.querySelector(`[data-op="${op}"]`);
    if(btn) btn.classList.add('active');
  }
  function clearOpHighlight(){
    document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('active'));
  }

  function createRipple(e, btn){
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size/2) + 'px';
    r.style.top  = (e.clientY - rect.top  - size/2) + 'px';
    btn.appendChild(r);
    r.addEventListener('animationend', ()=> r.remove());
  }

  document.querySelector('.grid').addEventListener('click', function(e){
    const btn = e.target.closest('.btn');
    if(!btn) return;
    createRipple(e, btn);

    const action = btn.dataset.action;
    switch(action){
      case 'num':     inputNum(btn.dataset.num); break;
      case 'decimal': inputDecimal(); break;
      case 'op':      inputOp(btn.dataset.op); break;
      case 'equals':  calculate(); break;
      case 'clear':   clear(); break;
      case 'sign':    toggleSign(); break;
      case 'percent': percent(); break;
    }
  });

  document.addEventListener('keydown', function(e){
    if(e.key >= '0' && e.key <= '9') inputNum(e.key);
    else if(e.key === '.') inputDecimal();
    else if(e.key === '+') inputOp('+');
    else if(e.key === '-') inputOp('-');
    else if(e.key === '*') inputOp('*');
    else if(e.key === '/'){e.preventDefault(); inputOp('/');}
    else if(e.key === 'Enter' || e.key === '=') calculate();
    else if(e.key === 'Escape' || e.key === 'c' || e.key === 'C') clear();
    else if(e.key === '%') percent();
    else if(e.key === 'Backspace'){
      if(current.length > 1 && !resetNext) current = current.slice(0,-1);
      else current = '0';
      updateDisplay();
    }
  });

  updateDisplay();
})();

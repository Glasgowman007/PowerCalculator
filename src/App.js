import './index.css';
import { useMemo, useState } from 'react';
import RotatingText from './RotatingText';

/* ---------- Quantities ---------- */
const QUANTITIES = {
  v: { label: 'Voltage', symbol: 'V', unit: 'V', color: 'volt' },
  i: { label: 'Current', symbol: 'I', unit: 'A', color: 'amp' },
  r: { label: 'Resistance', symbol: 'R', unit: 'Ω', color: 'ohm' },
  p: { label: 'Power', symbol: 'P', unit: 'kW', color: 'watt' },
  t: { label: 'Time', symbol: 't', unit: 'hours', color: 'time' },
  e: { label: 'Energy', symbol: 'E', unit: 'kWh', color: 'energy' },
};

const COLOR = {
  volt: { text: 'text-volt', bg: 'bg-volt', soft: 'bg-volt/10', ring: 'focus:ring-volt', border: 'border-volt' },
  amp: { text: 'text-amp', bg: 'bg-amp', soft: 'bg-amp/10', ring: 'focus:ring-amp', border: 'border-amp' },
  ohm: { text: 'text-ohm', bg: 'bg-ohm', soft: 'bg-ohm/10', ring: 'focus:ring-ohm', border: 'border-ohm' },
  watt: { text: 'text-watt', bg: 'bg-watt', soft: 'bg-watt/10', ring: 'focus:ring-watt', border: 'border-watt' },
  time: { text: 'text-slate-600', bg: 'bg-slate-600', soft: 'bg-slate-100', ring: 'focus:ring-slate-500', border: 'border-slate-500' },
  energy: { text: 'text-energy', bg: 'bg-energy', soft: 'bg-energy/10', ring: 'focus:ring-energy', border: 'border-energy' },
};

const MAIN_KEYS = ['v', 'i', 'r', 'p'];

/* Format numbers: up to 3 decimal places, no trailing zeros */
const fmt = (n) => {
  if (n === undefined || n === null || !isFinite(n)) return '';
  const rounded = Math.round(n * 1000) / 1000;
  return rounded.toLocaleString('en-GB', { maximumFractionDigits: 3 });
};

/* ---------- Solver: returns values + worked steps ---------- */
function solve(raw) {
  const k = {};
  for (const key of ['v', 'i', 'r', 'p', 't']) {
    const n = parseFloat(raw[key]);
    if (!isNaN(n)) k[key] = n;
  }
  const given = MAIN_KEYS.filter((key) => key in k);
  const hasTime = 't' in k;

  if (given.length < 2 && !(given.includes('p') && hasTime)) {
    return { error: 'Enter any two of voltage, current, resistance and power (plus time if you want energy).' };
  }
  for (const key of [...given, ...(hasTime ? ['t'] : [])]) {
    if (k[key] <= 0) return { error: `${QUANTITIES[key].label} must be greater than zero.` };
  }

  const steps = [];
  let { v, i, r, p } = k;
  const pair = given.slice(0, 2).sort().join('');

  switch (pair) {
    case 'iv': // V and I
      r = v / i;
      steps.push({ find: 'r', formula: 'R = V ÷ I', working: `${fmt(v)} ÷ ${fmt(i)}`, result: r });
      p = (v * i) / 1000;
      steps.push({ find: 'p', formula: 'P = V × I', working: `${fmt(v)} × ${fmt(i)} = ${fmt(v * i)} W`, result: p, note: '÷ 1000 to convert watts to kilowatts' });
      break;
    case 'rv': // V and R
      i = v / r;
      steps.push({ find: 'i', formula: 'I = V ÷ R', working: `${fmt(v)} ÷ ${fmt(r)}`, result: i });
      p = (v * i) / 1000;
      steps.push({ find: 'p', formula: 'P = V × I', working: `${fmt(v)} × ${fmt(i)} = ${fmt(v * i)} W`, result: p, note: `Check: P = V² ÷ R = ${fmt(v)}² ÷ ${fmt(r)} = ${fmt((v * v) / r)} W` });
      break;
    case 'ir': // I and R
      v = i * r;
      steps.push({ find: 'v', formula: 'V = I × R', working: `${fmt(i)} × ${fmt(r)}`, result: v });
      p = (v * i) / 1000;
      steps.push({ find: 'p', formula: 'P = V × I', working: `${fmt(v)} × ${fmt(i)} = ${fmt(v * i)} W`, result: p, note: `Check: P = I² × R = ${fmt(i)}² × ${fmt(r)} = ${fmt(i * i * r)} W` });
      break;
    case 'pv': // P and V
      i = (p * 1000) / v;
      steps.push({ find: 'i', formula: 'I = P ÷ V', working: `(${fmt(p)} × 1000) ÷ ${fmt(v)}`, result: i, note: 'Convert kW to W first (× 1000)' });
      r = v / i;
      steps.push({ find: 'r', formula: 'R = V ÷ I', working: `${fmt(v)} ÷ ${fmt(i)}`, result: r });
      break;
    case 'ip': // P and I
      v = (p * 1000) / i;
      steps.push({ find: 'v', formula: 'V = P ÷ I', working: `(${fmt(p)} × 1000) ÷ ${fmt(i)}`, result: v, note: 'Convert kW to W first (× 1000)' });
      r = v / i;
      steps.push({ find: 'r', formula: 'R = V ÷ I', working: `${fmt(v)} ÷ ${fmt(i)}`, result: r });
      break;
    case 'pr': // P and R
      i = Math.sqrt((p * 1000) / r);
      steps.push({ find: 'i', formula: 'I = √(P ÷ R)', working: `√((${fmt(p)} × 1000) ÷ ${fmt(r)})`, result: i, note: 'Convert kW to W first (× 1000)' });
      v = i * r;
      steps.push({ find: 'v', formula: 'V = I × R', working: `${fmt(i)} × ${fmt(r)}`, result: v });
      break;
    default:
      break; // only P (+ time) given
  }

  let e;
  if (hasTime && p !== undefined) {
    e = p * k.t;
    steps.push({ find: 'e', formula: 'E = P × t', working: `${fmt(p)} × ${fmt(k.t)}`, result: e });
  }

  return { values: { v, i, r, p, t: k.t, e }, given: [...given, ...(hasTime ? ['t'] : [])], steps };
}

/* ---------- Components ---------- */
function Field({ id, value, onChange, disabled }) {
  const q = QUANTITIES[id];
  const c = COLOR[q.color];
  return (
    <label className={`block transition-opacity ${disabled ? 'opacity-40' : ''}`}>
      <span className="flex items-center gap-2 mb-1.5 text-sm font-semibold text-slate-700">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white ${c.bg}`}>{q.symbol}</span>
        {q.label}
      </span>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          disabled={disabled}
          placeholder={disabled ? 'Will be calculated' : 'Leave blank if unknown'}
          className={`w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 pr-16 text-lg text-slate-900 placeholder:text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${c.ring} disabled:cursor-not-allowed`}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-slate-500">{q.unit}</span>
      </div>
    </label>
  );
}

function Circuit({ shown }) {
  const val = (k) => (shown[k] !== undefined ? `${fmt(shown[k])} ${QUANTITIES[k].unit}` : '?');
  return (
    <svg viewBox="0 0 420 200" className="w-full h-auto" role="img" aria-label="Simple circuit showing a supply, current and a resistor">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <polygon points="0 0, 10 4, 0 8" fill="#db2777" />
        </marker>
      </defs>
      {/* Loop wire */}
      <path d="M70 60 H350 V150 H70 Z" fill="none" stroke="#334155" strokeWidth="3" strokeLinejoin="round" />
      {/* Supply (battery symbol) on left side */}
      <rect x="55" y="90" width="30" height="30" fill="#fff" />
      <line x1="52" y1="98" x2="88" y2="98" stroke="#2563eb" strokeWidth="4" />
      <line x1="60" y1="110" x2="80" y2="110" stroke="#2563eb" strokeWidth="4" />
      <text x="40" y="108" textAnchor="end" className="fill-volt" fontSize="14" fontWeight="700">V</text>
      <text x="40" y="126" textAnchor="end" fill="#2563eb" fontSize="13">{val('v')}</text>
      {/* Resistor on top */}
      <rect x="170" y="45" width="90" height="30" rx="4" fill="#fff" stroke="#7c3aed" strokeWidth="3" />
      <text x="215" y="65" textAnchor="middle" fill="#7c3aed" fontSize="14" fontWeight="700">R</text>
      <text x="215" y="32" textAnchor="middle" fill="#7c3aed" fontSize="13">{val('r')}</text>
      {/* Current arrow on right */}
      <line x1="350" y1="85" x2="350" y2="125" stroke="#db2777" strokeWidth="3" markerEnd="url(#arrow)" />
      <text x="368" y="102" fill="#db2777" fontSize="14" fontWeight="700">I</text>
      <text x="368" y="120" fill="#db2777" fontSize="13">{val('i')}</text>
      {/* Power label at bottom */}
      <text x="210" y="178" textAnchor="middle" fill="#d97706" fontSize="13">
        <tspan fontWeight="700">P</tspan> = {val('p')}
      </text>
    </svg>
  );
}

function ValueTile({ id, value, isGiven, revealed }) {
  const q = QUANTITIES[id];
  const c = COLOR[q.color];
  const has = value !== undefined;
  return (
    <div className={`rounded-xl border-l-4 ${c.border} ${c.soft} px-3 py-2.5`}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span>{q.label}</span>
        {has && isGiven && <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-500">given</span>}
      </div>
      <div className={`mt-0.5 text-xl font-bold ${c.text}`}>
        {!has ? <span className="text-slate-300">—</span> : revealed ? `${fmt(value)} ${q.unit}` : <span className="text-slate-400">?</span>}
      </div>
    </div>
  );
}

function Step({ step, index }) {
  const q = QUANTITIES[step.find];
  const c = COLOR[q.color];
  return (
    <li className="animate-in rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${c.bg}`}>{index + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-500">Find the {q.label.toLowerCase()}</div>
          <div className="mt-1 font-mono text-lg text-slate-900">{step.formula}</div>
          <div className="mt-1 font-mono text-slate-700 break-words">
            = {step.working} ⇒ <span className={`font-bold ${c.text}`}>{fmt(step.result)} {q.unit}</span>
          </div>
          {step.note && <div className="mt-2 text-sm text-slate-500">{step.note}</div>}
        </div>
      </div>
    </li>
  );
}

const FORMULAS = [
  ['V = I × R', 'Ohm’s law'],
  ['I = V ÷ R', ''],
  ['R = V ÷ I', ''],
  ['P = V × I', 'watts'],
  ['P = I² × R', ''],
  ['P = V² ÷ R', ''],
  ['E = P × t', 'kWh = kW × hours'],
  ['1 kW = 1000 W', ''],
];

/* ---------- App ---------- */
const EMPTY = { v: '', i: '', r: '', p: '', t: '' };

export default function App() {
  const [inputs, setInputs] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(0);

  const filledMain = MAIN_KEYS.filter((k) => inputs[k] !== '').length;
  const isDisabled = (k) => k !== 't' && filledMain >= 2 && inputs[k] === '';

  const onChange = (k, val) => {
    setInputs((s) => ({ ...s, [k]: val }));
    setResult(null);
  };

  const calculate = (e) => {
    e.preventDefault();
    setResult(solve(inputs));
    setRevealed(0);
  };

  const reset = () => {
    setInputs(EMPTY);
    setResult(null);
    setRevealed(0);
  };

  const steps = result?.steps ?? [];
  const allShown = steps.length > 0 && revealed >= steps.length;

  // Values visible so far: given ones plus any found in revealed steps
  const shown = useMemo(() => {
    const out = {};
    if (!result?.values) {
      for (const k of ['v', 'i', 'r', 'p']) {
        const n = parseFloat(inputs[k]);
        if (!isNaN(n)) out[k] = n;
      }
      return out;
    }
    for (const [k, val] of Object.entries(result.values)) {
      if (val !== undefined) out[k] = val;
    }
    return out;
  }, [result, inputs]);

  return (
    <div className="min-h-screen bg-paper text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-5 sm:px-6">
          <span className="text-2xl">⚡</span>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Calculate
            <RotatingText
              texts={['Power', 'Voltage', 'Current', 'Resistance', 'Energy']}
              mainClassName="inline-flex bg-ohm text-white px-2.5 py-0.5 rounded-lg overflow-hidden"
              staggerFrom="last"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              rotationInterval={2200}
            />
          </h1>
          <p className="w-full text-slate-600 sm:w-auto sm:ml-auto sm:text-right sm:text-sm">
            A practice tool for electrical calculations
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* How to use */}
        <section className="mb-6 rounded-xl bg-ohm/5 border border-ohm/20 px-5 py-4 text-slate-700">
          <h2 className="font-bold text-slate-900">How to use it</h2>
          <ol className="mt-1 list-decimal pl-5 space-y-0.5 text-sm sm:text-base">
            <li>Enter <strong>two</strong> known values from voltage, current, resistance and power. Add time if you also want energy.</li>
            <li>Work out the missing values yourself on paper.</li>
            <li>Press <strong>Calculate</strong> to check your answers, then go through the working step by step.</li>
          </ol>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Inputs + formulas */}
          <div className="space-y-6 lg:self-start">
          <form onSubmit={calculate} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Known values</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${filledMain >= 2 ? 'bg-energy/10 text-energy' : 'bg-slate-100 text-slate-500'}`}>
                {Math.min(filledMain, 2)} of 2 entered
              </span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {MAIN_KEYS.map((k) => (
                <Field key={k} id={k} value={inputs[k]} onChange={onChange} disabled={isDisabled(k)} />
              ))}
            </div>
            <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> Optional, for energy <span className="h-px flex-1 bg-slate-200" />
            </div>
            <Field id="t" value={inputs.t} onChange={onChange} disabled={false} />
            <div className="mt-6 flex gap-3">
              <button type="submit" className="flex-1 rounded-lg bg-ohm px-4 py-3 font-bold text-white shadow-sm transition hover:bg-ohm/90 focus:outline-none focus:ring-2 focus:ring-ohm focus:ring-offset-2">
                Calculate
              </button>
              <button type="button" onClick={reset} className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                Reset
              </button>
            </div>
          </form>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold">Formula reference</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                {FORMULAS.map(([f, note]) => (
                  <li key={f} className="rounded-lg bg-slate-50 px-3 py-2">
                    <div className="font-mono font-semibold text-slate-900">{f}</div>
                    {note && <div className="text-xs text-slate-500">{note}</div>}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Output */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold">Circuit</h2>
              <div className="mx-auto mt-2 max-w-md">
                <Circuit shown={shown} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-live="polite">
              <h2 className="text-lg font-bold">Results &amp; working</h2>

              {!result && (
                <p className="mt-3 text-slate-500">Enter two values and press <strong>Calculate</strong> to see the results here.</p>
              )}

              {result?.error && (
                <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-red-700">{result.error}</p>
              )}

              {result?.values && (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {['v', 'i', 'r', 'p', 't', 'e'].map((k) => (
                      <ValueTile
                        key={k}
                        id={k}
                        value={result.values[k]}
                        isGiven={result.given.includes(k)}
                        revealed={k in shown || result.given.includes(k)}
                      />
                    ))}
                  </div>

                  <ol className="mt-5 space-y-3">
                    {steps.slice(0, revealed).map((s, idx) => (
                      <Step key={idx} step={s} index={idx} />
                    ))}
                  </ol>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {!allShown ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setRevealed((n) => n + 1)}
                          className="rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-700"
                        >
                          {revealed === 0 ? 'Show working step by step' : `Next step (${revealed + 1} of ${steps.length})`}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRevealed(steps.length)}
                          className="rounded-lg px-3 py-2.5 font-semibold text-slate-600 underline-offset-2 hover:underline"
                        >
                          Show all working
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-energy">✓ All steps shown</span>
                        <button
                          type="button"
                          onClick={() => setRevealed(0)}
                          className="rounded-lg px-3 py-2.5 font-semibold text-slate-600 underline-offset-2 hover:underline"
                        >
                          Hide working
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="pb-8 text-center text-sm text-slate-500">
        A learning aid. The goal is to understand the method, not just get the number.
      </footer>
    </div>
  );
}

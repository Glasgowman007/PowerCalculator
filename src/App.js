import './App.css';
import './index.css';
import { useState } from 'react';
import ScrollReveal from './ScrollReveal';
import ResultsReveal from './ResultsReveal';
import RotatingText from './RotatingText';

function App() {
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [resistance, setResistance] = useState('');
  const [power, setPower] = useState('');
  const [time, setTime] = useState('');
  const [calculated, setCalculated] = useState({ v: '', i: '', r: '', p: '', t: '', e: '' });
  const [resultIndex, setResultIndex] = useState(0);

  const calculate = (e) => {
    e.preventDefault();
    let v = parseFloat(voltage);
    let i = parseFloat(current);
    let r = parseFloat(resistance);
    let p = parseFloat(power);
    let t = parseFloat(time);
    let eVal = null;
    // Try to calculate missing values based on available inputs
    // 1. If any two of V, I, R are present, calculate the third and power
    if (!isNaN(v) && !isNaN(i)) {
      r = v / i;
      p = isNaN(p) ? (v * i) / 1000 : p;
    } else if (!isNaN(v) && !isNaN(r)) {
      i = v / r;
      p = isNaN(p) ? (v * i) / 1000 : p;
    } else if (!isNaN(i) && !isNaN(r)) {
      v = i * r;
      p = isNaN(p) ? (v * i) / 1000 : p;
    }
    // 2. If Power and Time are present, calculate Energy
    if (!isNaN(p) && !isNaN(t)) {
      eVal = p * t;
    }
    // 3. If Power and Voltage are present, calculate Current
    if (!isNaN(p) && !isNaN(v)) {
      i = p * 1000 / v;
      r = v / i;
    }
    // 4. If Power and Current are present, calculate Voltage
    if (!isNaN(p) && !isNaN(i)) {
      v = p * 1000 / i;
      r = v / i;
    }
    // 5. If Power and Resistance are present, calculate Current and Voltage
    if (!isNaN(p) && !isNaN(r)) {
      i = Math.sqrt((p * 1000) / r);
      v = i * r;
    }
    setCalculated({
      v: isNaN(v) ? '' : v.toFixed(2),
      i: isNaN(i) ? '' : i.toFixed(2),
      r: isNaN(r) ? '' : r.toFixed(2),
      p: isNaN(p) ? '' : p.toFixed(3),
      t: isNaN(t) ? '' : t.toFixed(2),
      e: eVal === null || isNaN(eVal) ? '' : eVal.toFixed(3),
    });
    setResultIndex(0); // Always show the first answer first
  };

  // Reset all fields
  const resetFields = () => {
    setVoltage('');
    setCurrent('');
    setResistance('');
    setPower('');
    setTime('');
    setCalculated({ v: '', i: '', r: '', p: '', t: '', e: '' });
    setResultIndex(0); // Reset to first answer
  };

  // Count how many of the main four inputs are filled (voltage, current, resistance, power)
  const mainInputs = [voltage, current, resistance, power];
  const filledMainInputs = mainInputs.filter(val => val !== '');
  const filledMainCount = filledMainInputs.length;

  // Disable logic: once 2 or more of the main four are filled, disable the other two
  const disableVoltage = filledMainCount >= 2 && voltage === '';
  const disableCurrent = filledMainCount >= 2 && current === '';
  const disableResistance = filledMainCount >= 2 && resistance === '';
  const disablePower = filledMainCount >= 2 && power === '';
  // Time is not affected
  const disableTime = false;

  return (
    <div className="min-h-screen bg-beige flex flex-col items-center justify-start py-8 px-2">
      {/* Title: Calculate stationary, rolling word next to it */}
      <div className="flex justify-center items-center w-full mb-8 mt-2">
        <span className="text-4xl md:text-5xl font-extrabold text-[#222] mr-8">Calculate</span>
        <div style={{ minWidth: '200px', display: 'flex', justifyContent: 'center' }}>
          <RotatingText
            texts={['Power', 'Voltage', 'Current', 'Resistance']}
            mainClassName="text-4xl md:text-5xl font-extrabold bg-[#5b2fff] text-white px-4 py-2 rounded-lg text-center"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
        </div>
      </div>
      <div className="max-w-2xl mx-auto mb-8 text-center text-lg text-[#333] bg-white bg-opacity-80 rounded-lg px-6 py-4 shadow">
        Use this calculator to practise your understanding of electrical calculations. Start by entering two known values – for example, voltage and current and time – and use the formulas to calculate the missing values for resistance, power, and energy. Once you've worked out your answers, you can click "Calculate" to check them. This tool will show the full working so you can follow each step and build confidence in applying formulas like P = VI and R = V/I. Use this as a learning aid – the goal is to understand, not just get the right number!
      </div>
      <div className="flex flex-col items-center w-full max-w-6xl">
        {/* Visual Diagram */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 flex flex-col items-center w-full">
          <svg width="600" height="220" className="mb-2">
            {/* Wires */}
            <line x1="80" y1="110" x2="200" y2="110" stroke="#181818" strokeWidth="6" />
            <line x1="340" y1="110" x2="520" y2="110" stroke="#181818" strokeWidth="6" />
            {/* Resistor label above rectangle */}
            <text x="270" y="80" fill="#7c3aed" fontSize="18" fontWeight="bold" textAnchor="middle">Resistor</text>
            {/* Resistor as rectangle with no fill */}
            <rect x="200" y="85" width="140" height="50" fill="none" stroke="#7c3aed" strokeWidth="4" rx="10" />
            {/* Resistance value inside rectangle */}
            {calculated.r && (
              <text x="270" y="115" fill="#7c3aed" fontSize="17" textAnchor="middle">{calculated.r} Ω</text>
            )}
            {/* Voltage value */}
            {calculated.v && (
              <text x="110" y="60" fill="#60a5fa" fontSize="18" textAnchor="middle">{calculated.v} V</text>
            )}
            <text x="110" y="180" fill="#60a5fa" fontSize="18" textAnchor="middle">Voltage</text>
            {/* Current value and arrow */}
            {calculated.i && (
              <text x="560" y="90" fill="#f472b6" fontSize="18" textAnchor="middle">{calculated.i} A</text>
            )}
            <line x1="500" y1="110" x2="540" y2="110" stroke="#f472b6" strokeWidth="4" markerEnd="url(#arrowhead)" />
            {/* Current label below */}
            <text x="470" y="180" fill="#f472b6" fontSize="18">Current</text>
            {/* Arrowhead marker */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
                <polygon points="0 0, 10 4, 0 8" fill="#f472b6" />
              </marker>
            </defs>
          </svg>
        </div>
        {/* Calculation Form and Results side by side on large screens, stacked on small screens */}
        <div className="flex flex-col md:flex-row w-full gap-6 mb-4">
          <form onSubmit={calculate} className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-1">
              <label className="text-black font-semibold">Voltage (V):</label>
              <input
                type="number"
                value={voltage}
                onChange={e => setVoltage(e.target.value)}
                placeholder="Enter voltage or leave blank"
                className="rounded-md px-3 py-2 bg-beige text-black focus:outline-none focus:ring-2 focus:ring-accentBlue"
                step="any"
                disabled={disableVoltage}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-black font-semibold">Current (A):</label>
              <input
                type="number"
                value={current}
                onChange={e => setCurrent(e.target.value)}
                placeholder="Enter current or leave blank"
                className="rounded-md px-3 py-2 bg-beige text-black focus:outline-none focus:ring-2 focus:ring-accentBlue"
                step="any"
                disabled={disableCurrent}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-black font-semibold">Resistance (Ω):</label>
              <input
                type="number"
                value={resistance}
                onChange={e => setResistance(e.target.value)}
                placeholder="Enter resistance or leave blank"
                className="rounded-md px-3 py-2 bg-beige text-black focus:outline-none focus:ring-2 focus:ring-accentBlue"
                step="any"
                disabled={disableResistance}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-black font-semibold">Power (kW):</label>
              <input
                type="number"
                value={power}
                onChange={e => setPower(e.target.value)}
                placeholder="Enter power or leave blank"
                className="rounded-md px-3 py-2 bg-beige text-black focus:outline-none focus:ring-2 focus:ring-accentBlue"
                step="any"
                disabled={disablePower}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-black font-semibold">Time (hours):</label>
              <input
                type="number"
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="Enter time or leave blank"
                className="rounded-md px-3 py-2 bg-beige text-black focus:outline-none focus:ring-2 focus:ring-accentBlue"
                step="any"
                disabled={disableTime}
              />
            </div>
            <div className="text-xs text-black text-center">Enter any two values to calculate the others.</div>
            <button type="submit" className="mt-2 bg-accentBlue hover:bg-accentPurple text-white font-bold py-2 px-4 rounded-lg shadow transition">Calculate</button>
            <button type="button" onClick={resetFields} className="mt-2 bg-accentPink hover:bg-accentPurple text-white font-bold py-2 px-4 rounded-lg shadow transition">Reset</button>
          </form>
          {calculated.p && (
            <ScrollReveal containerClassName="w-full">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full text-black self-start">
                <div className="space-y-1 text-lg">
                  <h2 id="answers-heading" className="text-5xl font-extrabold text-accentBlue mb-10">Results</h2>
                  {(() => {
                    // Use calculated values for displaying results
                    const v = calculated.v;
                    const i = calculated.i;
                    const r = calculated.r;
                    const p = calculated.p;
                    const t = calculated.t;
                    const e = calculated.e;
                    const results = [];

                    // --- Always show current, voltage, and power calculations first if possible ---
                    // Current
                    if (p && v) {
                      results.push(
                        <ScrollReveal key="calc-current-pv" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">I = (P × 1000) / V</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{p} × 1000 / {v} = {i} A</div>
                          </div>
                        </ScrollReveal>
                      );
                    } else if (v && r) {
                      results.push(
                        <ScrollReveal key="calc-current-vr" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">I = V / R</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{v} / {r} = {i} A</div>
                          </div>
                        </ScrollReveal>
                      );
                    }

                    // Voltage
                    if (i && r) {
                      results.push(
                        <ScrollReveal key="calc-voltage-ir" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">V = I × R</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{i} × {r} = {v} V</div>
                          </div>
                        </ScrollReveal>
                      );
                    } else if (p && i) {
                      results.push(
                        <ScrollReveal key="calc-voltage-pi" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">V = (P × 1000) / I</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{p} × 1000 / {i} = {v} V</div>
                          </div>
                        </ScrollReveal>
                      );
                    }

                    // Power
                    if (v && i) {
                      results.push(
                        <ScrollReveal key="calc-power-vi" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">P = V × I / 1000</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{v} × {i} / 1000 = {p} kW</div>
                          </div>
                        </ScrollReveal>
                      );
                    }

                    // Calculation Steps
                    if (v && i) {
                      results.push(
                        <ScrollReveal key="r" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">R = V / I</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{v} / {i} = {r} Ω</div>
                          </div>
                        </ScrollReveal>
                      );
                      results.push(
                        <ScrollReveal key="p" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">P = V × I</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{v} × {i} = {(parseFloat(v) * parseFloat(i)).toFixed(2)} W</div>
                          </div>
                        </ScrollReveal>
                      );
                      results.push(
                        <ScrollReveal key="pkW" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">P (kW) = P / 1000</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{(parseFloat(v) * parseFloat(i)).toFixed(2)} / 1000 = {p} kW</div>
                          </div>
                        </ScrollReveal>
                      );
                      if (r) {
                        const pIsqR = (Math.pow(parseFloat(i), 2) * parseFloat(r)).toFixed(2);
                        results.push(
                          <ScrollReveal key="p-isqr" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                            <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                              <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">P = I²R</div>
                              <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{i}² × {r} = {pIsqR} W</div>
                            </div>
                          </ScrollReveal>
                        );
                      }
                    } else if (v && r) {
                      results.push(
                        <ScrollReveal key="i" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">I = V / R</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{v} / {r} = {i} A</div>
                          </div>
                        </ScrollReveal>
                      );
                      results.push(
                        <ScrollReveal key="p" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">P = V × I</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{v} × {i} = {(parseFloat(v) * parseFloat(i)).toFixed(2)} W</div>
                          </div>
                        </ScrollReveal>
                      );
                      results.push(
                        <ScrollReveal key="pkW" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">P (kW) = P / 1000</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{(parseFloat(v) * parseFloat(i)).toFixed(2)} / 1000 = {p} kW</div>
                          </div>
                        </ScrollReveal>
                      );
                      if (r) {
                        const pVsqR = (Math.pow(parseFloat(v), 2) / parseFloat(r)).toFixed(2);
                        results.push(
                          <ScrollReveal key="p-vsqr" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                            <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                              <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">P = V² / R</div>
                              <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{v}² / {r} = {pVsqR} W</div>
                            </div>
                          </ScrollReveal>
                        );
                      }
                    } else if (i && r) {
                      results.push(
                        <ScrollReveal key="v" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">V = I × R</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{i} × {r} = {v} V</div>
                          </div>
                        </ScrollReveal>
                      );
                      results.push(
                        <ScrollReveal key="p" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">P = V × I</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{v} × {i} = {(parseFloat(v) * parseFloat(i)).toFixed(2)} W</div>
                          </div>
                        </ScrollReveal>
                      );
                      results.push(
                        <ScrollReveal key="pkW" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">P (kW) = P / 1000</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{(parseFloat(v) * parseFloat(i)).toFixed(2)} / 1000 = {p} kW</div>
                          </div>
                        </ScrollReveal>
                      );
                      if (r) {
                        const pIsqR = (Math.pow(parseFloat(i), 2) * parseFloat(r)).toFixed(2);
                        results.push(
                          <ScrollReveal key="p-isqr-2" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                            <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                              <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">P = I²R</div>
                              <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{i}² × {r} = {pIsqR} W</div>
                            </div>
                          </ScrollReveal>
                        );
                      }
                      if (v && r) {
                        const pVsqR = (Math.pow(parseFloat(v), 2) / parseFloat(r)).toFixed(2);
                        results.push(
                          <ScrollReveal key="p-vsqr-2" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                            <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                              <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">P = V² / R</div>
                              <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{v}² / {r} = {pVsqR} W</div>
                            </div>
                          </ScrollReveal>
                        );
                      }
                    }
                    // Show energy formulas if relevant
                    if (calculated.v && calculated.i && calculated.t) {
                      const energy = (parseFloat(calculated.v) * parseFloat(calculated.i) * parseFloat(calculated.t) / 1000).toFixed(3);
                      results.push(
                        <ScrollReveal key="energy-long-vit" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">Energy (kWh) = Voltage (V) × Current (A) × Time (hours) / 1000</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{calculated.v} × {calculated.i} × {calculated.t} / 1000 = {energy} kWh</div>
                          </div>
                        </ScrollReveal>
                      );
                    } else if (calculated.p && calculated.t) {
                      results.push(
                        <ScrollReveal key="energy-long" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                          <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">Energy (kWh) = Power (kW) × Time (hours)</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-accentBlue">{calculated.p} × {calculated.t} = {calculated.e} kWh</div>
                          </div>
                        </ScrollReveal>
                      );
                    }
                    // Answers
                    results.push(
                      <ScrollReveal key="ans-v" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                        <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                          <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">Voltage (V):</div>
                          <div className="text-5xl md:text-6xl font-extrabold text-accentBlue">{calculated.v}</div>
                        </div>
                      </ScrollReveal>
                    );
                    results.push(
                      <ScrollReveal key="ans-i" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                        <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                          <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">Current (A):</div>
                          <div className="text-5xl md:text-6xl font-extrabold text-accentBlue">{calculated.i}</div>
                        </div>
                      </ScrollReveal>
                    );
                    results.push(
                      <ScrollReveal key="ans-r" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                        <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                          <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">Resistance (Ω):</div>
                          <div className="text-5xl md:text-6xl font-extrabold text-accentBlue">{calculated.r}</div>
                        </div>
                      </ScrollReveal>
                    );
                    results.push(
                      <ScrollReveal key="ans-p" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                        <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                          <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">Power (kW):</div>
                          <div className="text-5xl md:text-6xl font-extrabold text-accentBlue">{calculated.p}</div>
                        </div>
                      </ScrollReveal>
                    );
                    results.push(
                      <ScrollReveal key="ans-t" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                        <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                          <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">Time (hours):</div>
                          <div className="text-5xl md:text-6xl font-extrabold text-accentBlue">{calculated.t}</div>
                        </div>
                      </ScrollReveal>
                    );
                    results.push(
                      <ScrollReveal key="ans-e" baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
                        <div className="reveal-answer flex flex-col items-center justify-center min-h-[12rem] h-48 md:h-64 text-center">
                          <div className="text-3xl md:text-4xl font-extrabold text-black mb-4">Energy (kWh):</div>
                          <div className="text-5xl md:text-6xl font-extrabold text-accentBlue">{calculated.e}</div>
                        </div>
                      </ScrollReveal>
                    );
                    // Only show one result at a time
                    const show = results[resultIndex] || null;
                    return (
                      <div className="flex flex-col items-center">
                        <div className="w-full">{show}</div>
                        <div className="flex gap-4 mt-6">
                          <button
                            className="bg-accentBlue hover:bg-accentPurple text-white font-bold py-2 px-6 rounded-lg text-xl shadow"
                            onClick={() => setResultIndex(i => Math.max(0, i - 1))}
                            disabled={resultIndex === 0}
                          >
                            Previous
                          </button>
                          <button
                            className="bg-accentBlue hover:bg-accentPurple text-white font-bold py-2 px-6 rounded-lg text-xl shadow"
                            onClick={() => setResultIndex(i => Math.min(results.length - 1, i + 1))}
                            disabled={resultIndex === results.length - 1}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

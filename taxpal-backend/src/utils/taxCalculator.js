/**
 * Advanced Multi-Country and State/Province Tax Calculator
 * Accurate calculation engine for Freelancers and Businesses
 */

/**
 * Auto-detects the current financial quarter:
 * - Apr to Jun  → Q1
 * - Jul to Sep  → Q2
 * - Oct to Dec  → Q3
 * - Jan to Mar  → Q4
 */
const getCurrentQuarter = (date = new Date()) => {
  const month = date.getUTCMonth() + 1; // 1 to 12
  if (month >= 4 && month <= 6) return 'Q1';
  if (month >= 7 && month <= 9) return 'Q2';
  if (month >= 10 && month <= 12) return 'Q3';
  return 'Q4';
};

/**
 * Calculate Quarterly & Annual Taxable Income
 */
const calculateTaxableIncome = (input) => {
  const gross = Number(input.grossIncomeForQuarter) || 0;
  const business = Number(input.businessExpenses) || 0;
  const retirement = Number(input.retirementContribution) || 0;
  const health = Number(input.healthInsurancePremiums) || 0;
  const homeOffice = Number(input.homeOfficeDeduction) || 0;

  const quarterlyDeductions = business + retirement + health + homeOffice;
  const quarterlyTaxableIncome = Math.max(0, gross - quarterlyDeductions);

  const annualGross = gross * 4;
  const annualDeductions = quarterlyDeductions * 4;
  const annualTaxableIncome = Math.max(0, annualGross - annualDeductions);

  return {
    quarterlyDeductions,
    quarterlyTaxableIncome,
    annualGross,
    annualDeductions,
    annualTaxableIncome,
  };
};

/**
 * 1. INDIA: Income Tax (New Regime Slabs) + State Professional Tax
 */
const calculateIndiaTax = (annualTaxableIncome, state) => {
  if (annualTaxableIncome <= 0) {
    return { federalTax: 0, stateTax: 0, selfEmploymentTax: 0, totalAnnualTax: 0 };
  }

  let baseTax = 0;
  if (annualTaxableIncome > 1500000) {
    baseTax += (annualTaxableIncome - 1500000) * 0.30;
    baseTax += 300000 * 0.20; // 12L - 15L
    baseTax += 200000 * 0.15; // 10L - 12L
    baseTax += 300000 * 0.10; // 7L - 10L
    baseTax += 400000 * 0.05; // 3L - 7L
  } else if (annualTaxableIncome > 1200000) {
    baseTax += (annualTaxableIncome - 1200000) * 0.20;
    baseTax += 200000 * 0.15;
    baseTax += 300000 * 0.10;
    baseTax += 400000 * 0.05;
  } else if (annualTaxableIncome > 1000000) {
    baseTax += (annualTaxableIncome - 1000000) * 0.15;
    baseTax += 300000 * 0.10;
    baseTax += 400000 * 0.05;
  } else if (annualTaxableIncome > 700000) {
    baseTax += (annualTaxableIncome - 700000) * 0.10;
    baseTax += 400000 * 0.05;
  } else if (annualTaxableIncome > 300000) {
    // Under Section 87A rebate, tax on taxable income up to 7 Lakhs is NIL
    baseTax = 0;
  } else {
    baseTax = 0;
  }

  // 4% Health & Education Cess
  const cess = baseTax * 0.04;
  const federalTax = baseTax + cess;

  // State Professional Tax
  const normState = (state || '').toLowerCase();
  let stateTax = 0;
  if (
    normState.includes('karnataka') ||
    normState.includes('maharashtra') ||
    normState.includes('tamil') ||
    normState.includes('telangana') ||
    normState.includes('kerala') ||
    normState.includes('west bengal') ||
    normState.includes('andhra') ||
    normState.includes('gujarat')
  ) {
    stateTax = annualTaxableIncome > 300000 ? 2400 : 0;
  }

  const totalAnnualTax = federalTax + stateTax;
  return {
    federalTax: Number(federalTax.toFixed(2)),
    stateTax: Number(stateTax.toFixed(2)),
    selfEmploymentTax: 0,
    totalAnnualTax: Number(totalAnnualTax.toFixed(2)),
  };
};

/**
 * 2. USA: Federal Progressive Brackets + Self-Employment Tax + State Income Tax
 */
const calculateUSATax = (annualTaxableIncome, filingStatus, state) => {
  if (annualTaxableIncome <= 0) {
    return { federalTax: 0, stateTax: 0, selfEmploymentTax: 0, totalAnnualTax: 0 };
  }

  // A. Federal Income Tax
  const status = (filingStatus || '').trim().toLowerCase();
  let rateKey = 'single';
  if (status.includes('joint') || status === 'married') {
    rateKey = 'mfj';
  } else if (status.includes('separat')) {
    rateKey = 'mfs';
  } else if (status.includes('head') || status.includes('hoh')) {
    rateKey = 'hoh';
  }

  const USA_LIMITS = [0, 11600, 47150, 100525, 191950, 243725, 609350, Infinity];
  const USA_RATES = {
    single: [10, 12, 22, 24, 32, 35, 37],
    mfj: [10, 12, 22, 24, 32, 35, 37],
    mfs: [10, 12, 22, 24, 32, 35, 37],
    hoh: [10, 12, 22, 24, 32, 35, 37],
  };

  const rates = USA_RATES[rateKey] || USA_RATES.single;
  let federalTax = 0;
  for (let i = 0; i < rates.length; i++) {
    const from = USA_LIMITS[i];
    const to = USA_LIMITS[i + 1];
    if (annualTaxableIncome > from) {
      const taxable = Math.min(annualTaxableIncome, to) - from;
      federalTax += taxable * (rates[i] / 100);
    }
  }

  // B. Self-Employment Tax (15.3% on 92.35% of profit, SS cap at $168,600)
  const seEarnings = annualTaxableIncome * 0.9235;
  const ssTax = Math.min(seEarnings, 168600) * 0.124;
  const medicareTax = seEarnings * 0.029;
  const selfEmploymentTax = ssTax + medicareTax;

  // C. State Income Tax
  const normState = (state || '').trim().toLowerCase();
  let stateTax = 0;

  if (normState === 'california') {
    const caLimits = [0, 10412, 24684, 38959, 54081, 68350, 349137, 418961, 698271, Infinity];
    const caRates = [1, 2, 4, 6, 8, 9.3, 10.3, 11.3, 12.3];
    for (let i = 0; i < caRates.length; i++) {
      const from = caLimits[i];
      const to = caLimits[i + 1];
      if (annualTaxableIncome > from) {
        stateTax += (Math.min(annualTaxableIncome, to) - from) * (caRates[i] / 100);
      }
    }
  } else if (normState === 'new york') {
    const nyLimits = [0, 8500, 11700, 13900, 80650, 215400, 1077550, 5000000, Infinity];
    const nyRates = [4, 4.5, 5.25, 5.85, 6.25, 6.85, 9.65, 10.3];
    for (let i = 0; i < nyRates.length; i++) {
      const from = nyLimits[i];
      const to = nyLimits[i + 1];
      if (annualTaxableIncome > from) {
        stateTax += (Math.min(annualTaxableIncome, to) - from) * (nyRates[i] / 100);
      }
    }
  } else if (normState === 'illinois') {
    stateTax = annualTaxableIncome * 0.0495;
  } else if (normState === 'pennsylvania') {
    stateTax = annualTaxableIncome * 0.0307;
  } else if (normState === 'new jersey') {
    stateTax = annualTaxableIncome * 0.055;
  } else if (normState === 'massachusetts') {
    stateTax = annualTaxableIncome * 0.05;
  } else if (normState === 'texas' || normState === 'florida' || normState === 'washington' || normState === 'nevada' || normState === 'wyoming' || normState === 'alaska' || normState === 'south dakota' || normState === 'tennessee') {
    stateTax = 0; // 0% state income tax
  } else {
    // Default US state tax avg
    stateTax = annualTaxableIncome * 0.045;
  }

  const totalAnnualTax = federalTax + selfEmploymentTax + stateTax;
  return {
    federalTax: Number(federalTax.toFixed(2)),
    stateTax: Number(stateTax.toFixed(2)),
    selfEmploymentTax: Number(selfEmploymentTax.toFixed(2)),
    totalAnnualTax: Number(totalAnnualTax.toFixed(2)),
  };
};

/**
 * 3. CANADA: Federal Brackets + Provincial Tax (Ontario, Quebec, BC, Alberta)
 */
const calculateCanadaTax = (annualTaxableIncome, state) => {
  if (annualTaxableIncome <= 0) {
    return { federalTax: 0, stateTax: 0, selfEmploymentTax: 0, totalAnnualTax: 0 };
  }

  // Federal
  const fedLimits = [0, 55867, 111733, 173205, 246752, Infinity];
  const fedRates = [15, 20.5, 26, 29, 33];
  let federalTax = 0;
  for (let i = 0; i < fedRates.length; i++) {
    const from = fedLimits[i];
    const to = fedLimits[i + 1];
    if (annualTaxableIncome > from) {
      federalTax += (Math.min(annualTaxableIncome, to) - from) * (fedRates[i] / 100);
    }
  }

  // Provincial
  const normState = (state || '').toLowerCase();
  let stateTax = 0;

  if (normState.includes('ontario')) {
    const onLimits = [0, 51446, 102894, 150000, 220000, Infinity];
    const onRates = [5.05, 9.15, 11.16, 12.16, 13.16];
    for (let i = 0; i < onRates.length; i++) {
      if (annualTaxableIncome > onLimits[i]) {
        stateTax += (Math.min(annualTaxableIncome, onLimits[i + 1]) - onLimits[i]) * (onRates[i] / 100);
      }
    }
  } else if (normState.includes('quebec')) {
    const qcLimits = [0, 51780, 103545, 126000, Infinity];
    const qcRates = [14, 19, 24, 25.75];
    for (let i = 0; i < qcRates.length; i++) {
      if (annualTaxableIncome > qcLimits[i]) {
        stateTax += (Math.min(annualTaxableIncome, qcLimits[i + 1]) - qcLimits[i]) * (qcRates[i] / 100);
      }
    }
  } else if (normState.includes('british columbia') || normState.includes('bc')) {
    const bcLimits = [0, 47937, 95875, 110076, 133664, 181232, 252752, Infinity];
    const bcRates = [5.06, 7.7, 10.5, 12.29, 14.7, 16.8, 20.5];
    for (let i = 0; i < bcRates.length; i++) {
      if (annualTaxableIncome > bcLimits[i]) {
        stateTax += (Math.min(annualTaxableIncome, bcLimits[i + 1]) - bcLimits[i]) * (bcRates[i] / 100);
      }
    }
  } else if (normState.includes('alberta')) {
    stateTax = annualTaxableIncome * 0.10;
  } else {
    stateTax = annualTaxableIncome * 0.08;
  }

  const totalAnnualTax = federalTax + stateTax;
  return {
    federalTax: Number(federalTax.toFixed(2)),
    stateTax: Number(stateTax.toFixed(2)),
    selfEmploymentTax: 0,
    totalAnnualTax: Number(totalAnnualTax.toFixed(2)),
  };
};

/**
 * 4. UNITED KINGDOM: HMRC Rates + Scotland Tax Rates
 */
const calculateUKTax = (annualTaxableIncome, state) => {
  if (annualTaxableIncome <= 0) {
    return { federalTax: 0, stateTax: 0, selfEmploymentTax: 0, totalAnnualTax: 0 };
  }

  const isScotland = (state || '').toLowerCase().includes('scotland');
  let federalTax = 0;

  if (isScotland) {
    const limits = [0, 12570, 14876, 26561, 43662, 75000, 125140, Infinity];
    const rates = [0, 19, 20, 21, 42, 45, 48];
    for (let i = 0; i < rates.length; i++) {
      if (annualTaxableIncome > limits[i]) {
        federalTax += (Math.min(annualTaxableIncome, limits[i + 1]) - limits[i]) * (rates[i] / 100);
      }
    }
  } else {
    const limits = [0, 12570, 50270, 125140, Infinity];
    const rates = [0, 20, 40, 45];
    for (let i = 0; i < rates.length; i++) {
      if (annualTaxableIncome > limits[i]) {
        federalTax += (Math.min(annualTaxableIncome, limits[i + 1]) - limits[i]) * (rates[i] / 100);
      }
    }
  }

  // National Insurance Class 4 for Freelancers (6% between £12,570 and £50,270, 2% above)
  let niTax = 0;
  if (annualTaxableIncome > 12570) {
    niTax += Math.min(annualTaxableIncome - 12570, 37700) * 0.06;
  }
  if (annualTaxableIncome > 50270) {
    niTax += (annualTaxableIncome - 50270) * 0.02;
  }

  const totalAnnualTax = federalTax + niTax;
  return {
    federalTax: Number(federalTax.toFixed(2)),
    stateTax: 0,
    selfEmploymentTax: Number(niTax.toFixed(2)),
    totalAnnualTax: Number(totalAnnualTax.toFixed(2)),
  };
};

/**
 * 5. AUSTRALIA: ATO Resident Slabs (Stage 3 Tax Cuts) + Medicare Levy
 */
const calculateAustraliaTax = (annualTaxableIncome) => {
  if (annualTaxableIncome <= 0) {
    return { federalTax: 0, stateTax: 0, selfEmploymentTax: 0, totalAnnualTax: 0 };
  }

  let federalTax = 0;
  if (annualTaxableIncome <= 18200) {
    federalTax = 0;
  } else if (annualTaxableIncome <= 45000) {
    federalTax = (annualTaxableIncome - 18200) * 0.16;
  } else if (annualTaxableIncome <= 135000) {
    federalTax = 4288 + (annualTaxableIncome - 45000) * 0.30;
  } else if (annualTaxableIncome <= 190000) {
    federalTax = 31288 + (annualTaxableIncome - 135000) * 0.37;
  } else {
    federalTax = 51638 + (annualTaxableIncome - 190000) * 0.45;
  }

  const medicareLevy = annualTaxableIncome > 26000 ? annualTaxableIncome * 0.02 : 0;
  const totalAnnualTax = federalTax + medicareLevy;

  return {
    federalTax: Number(federalTax.toFixed(2)),
    stateTax: 0,
    selfEmploymentTax: Number(medicareLevy.toFixed(2)),
    totalAnnualTax: Number(totalAnnualTax.toFixed(2)),
  };
};

/**
 * 6. GERMANY: Einkommensteuer Progressive Formula
 */
const calculateGermanyTax = (annualTaxableIncome) => {
  if (annualTaxableIncome <= 11784) {
    return { federalTax: 0, stateTax: 0, selfEmploymentTax: 0, totalAnnualTax: 0 };
  }

  let federalTax = 0;
  if (annualTaxableIncome <= 17005) {
    const y = (annualTaxableIncome - 11784) / 10000;
    federalTax = (995.21 * y + 1400) * y;
  } else if (annualTaxableIncome <= 66760) {
    const z = (annualTaxableIncome - 17005) / 10000;
    federalTax = (208.85 * z + 2397) * z + 1015.51;
  } else if (annualTaxableIncome <= 277825) {
    federalTax = 0.42 * annualTaxableIncome - 10636.31;
  } else {
    federalTax = 0.45 * annualTaxableIncome - 18971.06;
  }

  const soli = federalTax > 18130 ? federalTax * 0.055 : 0;
  const totalAnnualTax = federalTax + soli;

  return {
    federalTax: Number(federalTax.toFixed(2)),
    stateTax: 0,
    selfEmploymentTax: Number(soli.toFixed(2)),
    totalAnnualTax: Number(totalAnnualTax.toFixed(2)),
  };
};

/**
 * 7. SWITZERLAND: Federal Tax + Cantonal Tax (Zurich, Geneva, Vaud, Bern)
 */
const calculateSwitzerlandTax = (annualTaxableIncome, state) => {
  if (annualTaxableIncome <= 15000) {
    return { federalTax: 0, stateTax: 0, selfEmploymentTax: 0, totalAnnualTax: 0 };
  }

  const federalTax = annualTaxableIncome * 0.06;
  const normState = (state || '').toLowerCase();
  let cantonRate = 0.12;
  if (normState.includes('geneva')) cantonRate = 0.16;
  else if (normState.includes('vaud')) cantonRate = 0.15;
  else if (normState.includes('bern')) cantonRate = 0.14;
  else if (normState.includes('zurich')) cantonRate = 0.13;

  const stateTax = annualTaxableIncome * cantonRate;
  const totalAnnualTax = federalTax + stateTax;

  return {
    federalTax: Number(federalTax.toFixed(2)),
    stateTax: Number(stateTax.toFixed(2)),
    selfEmploymentTax: 0,
    totalAnnualTax: Number(totalAnnualTax.toFixed(2)),
  };
};

/**
 * 8. JAPAN: National Income Tax + Local Inhabitant Tax
 */
const calculateJapanTax = (annualTaxableIncome, state) => {
  if (annualTaxableIncome <= 0) {
    return { federalTax: 0, stateTax: 0, selfEmploymentTax: 0, totalAnnualTax: 0 };
  }

  const limits = [0, 1950000, 3300000, 6950000, 9000000, 18000000, 40000000, Infinity];
  const rates = [5, 10, 20, 23, 33, 40, 45];
  let federalTax = 0;
  for (let i = 0; i < rates.length; i++) {
    if (annualTaxableIncome > limits[i]) {
      federalTax += (Math.min(annualTaxableIncome, limits[i + 1]) - limits[i]) * (rates[i] / 100);
    }
  }

  const normState = (state || '').toLowerCase();
  const stateTax = normState.includes('none') ? 0 : annualTaxableIncome * 0.10;
  const totalAnnualTax = federalTax + stateTax;

  return {
    federalTax: Number(federalTax.toFixed(2)),
    stateTax: Number(stateTax.toFixed(2)),
    selfEmploymentTax: 0,
    totalAnnualTax: Number(totalAnnualTax.toFixed(2)),
  };
};

/**
 * 9. DEFAULT / OTHER: 10% Flat
 */
const calculateDefaultTax = (annualTaxableIncome) => {
  if (annualTaxableIncome <= 0) {
    return { federalTax: 0, stateTax: 0, selfEmploymentTax: 0, totalAnnualTax: 0 };
  }
  const tax = annualTaxableIncome * 0.10;
  return {
    federalTax: Number(tax.toFixed(2)),
    stateTax: 0,
    selfEmploymentTax: 0,
    totalAnnualTax: Number(tax.toFixed(2)),
  };
};

/**
 * Main Dispatcher: Compute Quarterly and Annual Breakdown
 */
const computeTaxEstimate = (input) => {
  const quarter = input.quarter || getCurrentQuarter();
  const { quarterlyGross, quarterlyDeductions, quarterlyTaxableIncome, annualTaxableIncome } =
    calculateTaxableIncome(input);

  const country = (input.country || '').trim().toLowerCase();
  const state = input.state || '';
  const filingStatus = input.filingStatus || 'Single';

  let result;
  if (country === 'india' || country === 'in') {
    result = calculateIndiaTax(annualTaxableIncome, state);
  } else if (country === 'united states' || country === 'usa' || country === 'us') {
    result = calculateUSATax(annualTaxableIncome, filingStatus, state);
  } else if (country === 'canada' || country === 'ca') {
    result = calculateCanadaTax(annualTaxableIncome, state);
  } else if (country === 'united kingdom' || country === 'uk' || country === 'gb') {
    result = calculateUKTax(annualTaxableIncome, state);
  } else if (country === 'australia' || country === 'au') {
    result = calculateAustraliaTax(annualTaxableIncome);
  } else if (country === 'germany' || country === 'de') {
    result = calculateGermanyTax(annualTaxableIncome);
  } else if (country === 'switzerland' || country === 'ch') {
    result = calculateSwitzerlandTax(annualTaxableIncome, state);
  } else if (country === 'japan' || country === 'jp') {
    result = calculateJapanTax(annualTaxableIncome, state);
  } else {
    result = calculateDefaultTax(annualTaxableIncome);
  }

  const quarterlyFederal = Number((result.federalTax / 4).toFixed(2));
  const quarterlyState = Number((result.stateTax / 4).toFixed(2));
  const quarterlySE = Number((result.selfEmploymentTax / 4).toFixed(2));
  const estimatedTax = Number((result.totalAnnualTax / 4).toFixed(2));
  const dueDate = calculateDueDate(quarter, input.year);

  return {
    quarter,
    grossIncome: Number(input.grossIncomeForQuarter) || 0,
    totalDeductions: quarterlyDeductions,
    taxableIncome: quarterlyTaxableIncome,
    annualTaxableIncome,
    federalTax: quarterlyFederal,
    stateTax: quarterlyState,
    selfEmploymentTax: quarterlySE,
    annualEstimatedTax: result.totalAnnualTax,
    estimatedTax,
    country: input.country,
    state: input.state || '',
    filingStatus: input.filingStatus || 'Single',
    dueDate,
  };
};

const calculateDueDate = (quarter, year) => {
  const currentYear = year || new Date().getFullYear();
  const normalizedQuarter = (quarter || '').trim().toUpperCase();

  switch (normalizedQuarter) {
    case 'Q1':
      return new Date(Date.UTC(currentYear, 5, 15));
    case 'Q2':
      return new Date(Date.UTC(currentYear, 8, 15));
    case 'Q3':
      return new Date(Date.UTC(currentYear, 11, 15));
    case 'Q4':
      return new Date(Date.UTC(currentYear + 1, 2, 15));
    default:
      return new Date(Date.UTC(currentYear, 5, 15));
  }
};

module.exports = {
  getCurrentQuarter,
  calculateTaxableIncome,
  calculateIndiaTax,
  calculateUSATax,
  calculateCanadaTax,
  calculateUKTax,
  calculateAustraliaTax,
  calculateGermanyTax,
  calculateSwitzerlandTax,
  calculateJapanTax,
  computeTaxEstimate,
  calculateDueDate,
};

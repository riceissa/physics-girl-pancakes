// recipe-scaler.ts
document.addEventListener('DOMContentLoaded', () => {
  // Get the input element
  const pancakeCountInput = document.getElementById('pancake-count') as HTMLInputElement;

  // Store the original values in an array to maintain order
  const valueElements: HTMLElement[] = [];
  const originalValues: (number | string)[] = [];
  const unitElements: (HTMLElement | null)[] = [];
  const originalUnits: string[] = [];

  // Unit conversion factors
  const unitConversions: Record<string, Record<string, number>> = {
    cup: {
      tbsp: 16,  // 1 cup = 16 tbsp
      tsp: 48    // 1 cup = 48 tsp
    },
    tbsp: {
      cup: 1/16, // 1 tbsp = 1/16 cup
      tsp: 3     // 1 tbsp = 3 tsp
    },
    tsp: {
      cup: 1/48, // 1 tsp = 1/48 cup
      tbsp: 1/3  // 1 tsp = 1/3 tbsp
    }
  };

  // Get all value spans
  const valueSpans = document.querySelectorAll('.value');

  // Store original values and elements
  valueSpans.forEach(span => {
    const valueSpan = span as HTMLElement;
    valueElements.push(valueSpan);

    // Find unit element (sibling with units class)
    const unitSpan = valueSpan.nextElementSibling?.classList.contains('units')
      ? valueSpan.nextElementSibling as HTMLElement
      : null;
    unitElements.push(unitSpan);

    // Store original unit
    const unitText = unitSpan?.textContent?.trim().toLowerCase() || '';
    originalUnits.push(unitText);

    // Handle fractions like 1/4 by converting to decimal
    let value = valueSpan.textContent || '';

    if (value.includes('/')) {
      const parts = value.split('/');
      const numerator = parseFloat(parts[0].trim());
      const denominator = parseFloat(parts[1].trim());
      originalValues.push(numerator / denominator);
    } else if (value === 'half') {
      originalValues.push(0.5);
    } else {
      originalValues.push(isNaN(parseFloat(value)) ? value : parseFloat(value));
    }
  });

  // Function to find the best unit for a measurement
  const findBestUnit = (value: number, currentUnit: string): { value: number, unit: string } => {
    // Normalize unit names
    let unit = currentUnit.replace(/s$/, ''); // Remove plural 's'

    // Only process known units
    if (!['cup', 'tbsp', 'tsp'].includes(unit)) {
      return { value, unit: currentUnit };
    }

    // Convert to smaller units if value is too small
    if (unit === 'cup' && value < 0.25) {
      return findBestUnit(value * unitConversions.cup.tbsp, 'tbsp');
    } else if (unit === 'tbsp' && value < 0.5) {
      return findBestUnit(value * unitConversions.tbsp.tsp, 'tsp');
    }

    // Convert to larger units if value is too large
    if (unit === 'tsp' && value >= 3) {
      return findBestUnit(value * unitConversions.tsp.tbsp, 'tbsp');
    } else if (unit === 'tbsp' && value >= 8) {
      return findBestUnit(value * unitConversions.tbsp.cup, 'cup');
    }

    // Handle pluralization
    if (value != 1) {
      unit += 's';
    }

    return { value, unit };
  };

  // Format a number as fraction or decimal
  const formatNumber = (value: number): string => {
    // Handle common fractions for better readability
    if (Math.abs(value - 0.25) < 0.01) return '1/4';
    if (Math.abs(value - 0.5) < 0.01) return '1/2';
    if (Math.abs(value - 0.75) < 0.01) return '3/4';
    if (Math.abs(value - 0.33) < 0.01) return '1/3';
    if (Math.abs(value - 0.67) < 0.01) return '2/3';
    if (Math.abs(value - 0.125) < 0.01) return '1/8';

    // Format other values
    if (value < 0.1) return value.toFixed(2);
    if (value < 1) return value.toFixed(1);

    return Number.isInteger(value)
      ? value.toString()
      : value.toFixed(1).replace(/\.0$/, '');
  };

  // Function to update all values based on current pancake count
  const updateValues = () => {
    const pancakeCount = parseInt(pancakeCountInput.value);
    if (isNaN(pancakeCount) || pancakeCount <= 0) {
      return; // Don't update if invalid input
    }

    const scaleFactor = pancakeCount / 6; // Base recipe is for 6 pancakes

    // Update each value
    originalValues.forEach((originalValue, index) => {
      const valueSpan = valueElements[index];
      const unitSpan = unitElements[index];
      const originalUnit = originalUnits[index];

      // Only scale numerical values
      if (typeof originalValue === 'number') {
        let scaledValue = originalValue * scaleFactor;

        // Check if we need to convert units
        if (unitSpan && originalUnit) {
          const bestMeasurement = findBestUnit(scaledValue, originalUnit);
          scaledValue = bestMeasurement.value;

          // Update unit text
          unitSpan.textContent = bestMeasurement.unit;
        }

        // Update value text
        valueSpan.textContent = formatNumber(scaledValue);
      }
    });
  };

  // Add event listener to the input
  pancakeCountInput.addEventListener('change', updateValues);
  pancakeCountInput.addEventListener('input', updateValues);

  // Initial update
  updateValues();
});

// Compile with: tsc --lib dom,es2015 --outFile recipe-scaler.js recipe-scaler.ts

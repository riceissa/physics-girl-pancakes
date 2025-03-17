// recipe-scaler.ts
document.addEventListener('DOMContentLoaded', () => {
  // Get the input element
  const pancakeCountInput = document.getElementById('pancake-count') as HTMLInputElement;

  // Store the original values to use as base for calculations
  const originalValues: Record<string, number | string> = {};
  const originalUnits: Record<string, string> = {};

  // Get all value spans
  const valueSpans = document.querySelectorAll('.value');

  // Store original values
  valueSpans.forEach(span => {
    const valueSpan = span as HTMLElement;
    const parentIdElement = valueSpan.closest('[id]');
    const parentId = parentIdElement ? parentIdElement.getAttribute('id') || '' : '';

    if (parentId) {
      // Handle fractions like 1/4 by converting to decimal
      let value = valueSpan.textContent || '';

      // ES5 compatible way to check if string contains '/'
      if (value.indexOf('/') !== -1) {
        const parts = value.split('/');
        const numerator = parseFloat(parts[0].trim());
        const denominator = parseFloat(parts[1].trim());
        originalValues[parentId] = numerator / denominator;
      } else if (value === 'half') {
        originalValues[parentId] = 0.5;
      } else {
        originalValues[parentId] = isNaN(parseFloat(value)) ? value : parseFloat(value);
      }

      // Store units if present
      const unitSpan = valueSpan.nextElementSibling as HTMLElement;
      if (unitSpan && unitSpan.classList.contains('units')) {
        originalUnits[parentId] = unitSpan.textContent || '';
      }
    }
  });

  // Function to update all values based on current pancake count
  const updateValues = () => {
    const pancakeCount = parseInt(pancakeCountInput.value);
    const scaleFactor = pancakeCount / 6; // Base recipe is for 6 pancakes

    // Update each value
    Object.keys(originalValues).forEach(id => {
      const valueContainer = document.getElementById(id);
      if (!valueContainer) return;

      const valueSpan = valueContainer.querySelector('.value') as HTMLElement;
      if (!valueSpan) return;

      const originalValue = originalValues[id];

      // Only scale numerical values
      if (typeof originalValue === 'number') {
        let scaledValue = (originalValue * scaleFactor);

        // Format the scaled value appropriately
        let formattedValue: string;

        // Handle common fractions for better readability
        if (Math.abs(scaledValue - 0.25) < 0.01) {
          formattedValue = '1/4';
        } else if (Math.abs(scaledValue - 0.5) < 0.01) {
          formattedValue = '1/2';
        } else if (Math.abs(scaledValue - 0.75) < 0.01) {
          formattedValue = '3/4';
        } else if (Math.abs(scaledValue - 0.33) < 0.01) {
          formattedValue = '1/3';
        } else if (Math.abs(scaledValue - 0.67) < 0.01) {
          formattedValue = '2/3';
        } else if (scaledValue < 0.1) {
          formattedValue = scaledValue.toFixed(2);
        } else if (scaledValue < 1) {
          formattedValue = scaledValue.toFixed(1);
        } else {
          // ES5 compatible way to check if number is integer
          const isInteger = (scaledValue % 1 === 0);
          formattedValue = isInteger
            ? scaledValue.toString()
            : scaledValue.toFixed(1).replace(/\.0$/, '');
        }

        valueSpan.textContent = formattedValue;
      }
    });
  };

  // Add event listener to the input
  pancakeCountInput.addEventListener('change', updateValues);
  pancakeCountInput.addEventListener('input', updateValues);

  // Initial update
  updateValues();
});

// Add a tsconfig.json file with:
// {
//   "compilerOptions": {
//     "target": "es5",
//     "lib": ["dom", "es5", "scripthost"],
//     "strict": true
//   }
// }

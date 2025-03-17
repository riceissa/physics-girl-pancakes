// recipe-scaler.ts
document.addEventListener('DOMContentLoaded', () => {
  // Get the input element
  const pancakeCountInput = document.getElementById('pancake-count') as HTMLInputElement;

  // Store the original values in an array to maintain order
  const valueElements: HTMLElement[] = [];
  const originalValues: (number | string)[] = [];

  // Get all value spans
  const valueSpans = document.querySelectorAll('.value');

  // Store original values and elements
  valueSpans.forEach(span => {
    const valueSpan = span as HTMLElement;
    valueElements.push(valueSpan);

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
        } else if (Math.abs(scaledValue - 0.125) < 0.01) {
          formattedValue = '1/8';
        } else if (scaledValue < 0.1) {
          formattedValue = scaledValue.toFixed(2);
        } else if (scaledValue < 1) {
          formattedValue = scaledValue.toFixed(1);
        } else {
          formattedValue = Number.isInteger(scaledValue)
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

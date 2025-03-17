// recipe-scaler.ts
document.addEventListener('DOMContentLoaded', function () {
    // Get the input element
    var pancakeCountInput = document.getElementById('pancake-count');
    // Store the original values in an array to maintain order
    var valueElements = [];
    var originalValues = [];
    var unitElements = [];
    var originalUnits = [];
    // Unit conversion factors
    var unitConversions = {
        cup: {
            tbsp: 16,
            tsp: 48 // 1 cup = 48 tsp
        },
        tbsp: {
            cup: 1 / 16,
            tsp: 3 // 1 tbsp = 3 tsp
        },
        tsp: {
            cup: 1 / 48,
            tbsp: 1 / 3 // 1 tsp = 1/3 tbsp
        }
    };
    // Get all value spans
    var valueSpans = document.querySelectorAll('.value');
    // Store original values and elements
    valueSpans.forEach(function (span) {
        var _a, _b;
        var valueSpan = span;
        valueElements.push(valueSpan);
        // Find unit element (sibling with units class)
        var unitSpan = ((_a = valueSpan.nextElementSibling) === null || _a === void 0 ? void 0 : _a.classList.contains('units'))
            ? valueSpan.nextElementSibling
            : null;
        unitElements.push(unitSpan);
        // Store original unit
        var unitText = ((_b = unitSpan === null || unitSpan === void 0 ? void 0 : unitSpan.textContent) === null || _b === void 0 ? void 0 : _b.trim().toLowerCase()) || '';
        originalUnits.push(unitText);
        // Handle fractions like 1/4 by converting to decimal
        var value = valueSpan.textContent || '';
        if (value.includes('/')) {
            var parts = value.split('/');
            var numerator = parseFloat(parts[0].trim());
            var denominator = parseFloat(parts[1].trim());
            originalValues.push(numerator / denominator);
        }
        else if (value === 'half') {
            originalValues.push(0.5);
        }
        else {
            originalValues.push(isNaN(parseFloat(value)) ? value : parseFloat(value));
        }
    });
    // Function to find the best unit for a measurement
    var findBestUnit = function (value, currentUnit) {
        // Normalize unit names
        var unit = currentUnit.replace(/s$/, ''); // Remove plural 's'
        // Only process known units
        if (!['cup', 'tbsp', 'tsp'].includes(unit)) {
            return { value: value, unit: currentUnit };
        }
        // Convert to smaller units if value is too small
        if (unit === 'cup' && value < 0.25) {
            return findBestUnit(value * unitConversions.cup.tbsp, 'tbsp');
        }
        else if (unit === 'tbsp' && value < 0.5) {
            return findBestUnit(value * unitConversions.tbsp.tsp, 'tsp');
        }
        // Convert to larger units if value is too large
        if (unit === 'tsp' && value >= 3) {
            return findBestUnit(value * unitConversions.tsp.tbsp, 'tbsp');
        }
        else if (unit === 'tbsp' && value >= 8) {
            return findBestUnit(value * unitConversions.tbsp.cup, 'cup');
        }
        // Handle pluralization
        if (value != 1) {
            unit += 's';
        }
        return { value: value, unit: unit };
    };
    // Format a number as fraction or decimal
    var formatNumber = function (value) {
        // Handle common fractions for better readability
        if (Math.abs(value - 0.25) < 0.01)
            return '1/4';
        if (Math.abs(value - 0.5) < 0.01)
            return '1/2';
        if (Math.abs(value - 0.75) < 0.01)
            return '3/4';
        if (Math.abs(value - 0.33) < 0.01)
            return '1/3';
        if (Math.abs(value - 0.67) < 0.01)
            return '2/3';
        if (Math.abs(value - 0.125) < 0.01)
            return '1/8';
        // Format other values
        if (value < 0.1)
            return value.toFixed(2);
        if (value < 1)
            return value.toFixed(1);
        return Number.isInteger(value)
            ? value.toString()
            : value.toFixed(1).replace(/\.0$/, '');
    };
    // Function to update all values based on current pancake count
    var updateValues = function () {
        var pancakeCount = parseInt(pancakeCountInput.value);
        if (isNaN(pancakeCount) || pancakeCount <= 0) {
            return; // Don't update if invalid input
        }
        var scaleFactor = pancakeCount / 6; // Base recipe is for 6 pancakes
        // Update each value
        originalValues.forEach(function (originalValue, index) {
            var valueSpan = valueElements[index];
            var unitSpan = unitElements[index];
            var originalUnit = originalUnits[index];
            // Only scale numerical values
            if (typeof originalValue === 'number') {
                var scaledValue = originalValue * scaleFactor;
                // Check if we need to convert units
                if (unitSpan && originalUnit) {
                    var bestMeasurement = findBestUnit(scaledValue, originalUnit);
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

document.addEventListener('DOMContentLoaded', function () {
    function amount_to_html(amount) {
        var result = document.createElement("span");
        result.className = "amount";
        var value = document.createElement("span");
        value.className = "value";
        value.textContent = String(amount.value);
        var units = document.createElement("span");
        units.className = "units";
        units.textContent = amount.units;
        result.appendChild(value);
        result.appendChild(document.createTextNode(" "));
        result.appendChild(units);
        return result;
    }
    function html_to_amount(e) {
        var _a, _b;
        if (!e) {
            console.log("Could not convert to amount", e);
            return null;
        }
        if (e.children.length != 2) {
            console.log("Could not convert to amount", e);
            return null;
        }
        var value_text = e.children[0].textContent || '';
        var value = 0;
        if (value_text.includes('/')) {
            var parts = value_text.split('/');
            var numerator = parseFloat(parts[0].trim());
            var denominator = parseFloat(parts[1].trim());
            value = numerator / denominator;
        }
        else if (value_text === 'half') {
            value = 0.5;
        }
        else if (!isNaN(parseFloat(value_text))) {
            value = parseFloat(value_text);
        }
        else {
            console.log("Could not convert to amount", e);
            return null;
        }
        var units_raw = e.children[1];
        var units = ((_b = (_a = units_raw === null || units_raw === void 0 ? void 0 : units_raw.textContent) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
        var amount = { value: value, units: units };
        return amount;
    }
    function amount_as_best_unit(amount) {
        // Normalize unit name - remove potential trailing 's'
        var unit = amount.units.replace(/s$/, '');
        var originalUnit = unit;
        // Only process known units
        if (!['cup', 'tbsp', 'tsp'].includes(unit)) {
            return { value: amount.value, units: originalUnit };
        }
        // Convert to smaller units if value is too small
        if (unit === 'cup' && amount.value < 0.25) {
            return amount_as_best_unit({ value: amount.value * unitConversions.cup.tbsp, units: 'tbsp' });
        }
        else if (unit === 'tbsp' && amount.value < 0.5) {
            return amount_as_best_unit({ value: amount.value * unitConversions.tbsp.tsp, units: 'tsp' });
        }
        // Convert to larger units if value is too large
        if (unit === 'tsp' && amount.value >= 3) {
            return amount_as_best_unit({ value: amount.value * unitConversions.tsp.tbsp, units: 'tbsp' });
        }
        else if (unit === 'tbsp' && amount.value >= 8) {
            return amount_as_best_unit({ value: amount.value * unitConversions.tbsp.cup, units: 'cup' });
        }
        // Handle pluralization only for units that should be pluralized
        if (amount.value != 1 && !noPluralize.includes(unit)) {
            unit += 's';
        }
        return { value: amount.value, units: unit };
    }
    // Format a number as fraction or decimal
    function formatNumber(value) {
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
    }
    // const a = {value: 0.5, units: "CUPS"} as Amount;
    // console.log(htmlToAmount(amountToHtml(a)));
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
    // Units that should not be pluralized
    var noPluralize = ['tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l'];
    var amount_elements = [];
    var original_amounts = [];
    document.querySelectorAll('.amount').forEach(function (amount_span) {
        var amount = html_to_amount(amount_span);
        if (amount) {
            amount_elements.push(amount_span);
            original_amounts.push(amount);
        }
    });
    // console.log(original_amounts);
    var pancakeCountInput = document.getElementById('pancake-count');
    function updateValues() {
        var pancakeCount = parseFloat(pancakeCountInput.value);
        if (isNaN(pancakeCount) || pancakeCount <= 0) {
            return; // Don't update if invalid input
        }
        var scaleFactor = pancakeCount / 6.0; // Base recipe is for 6 pancakes
        original_amounts.forEach(function (original_amount, index) {
            var amount_span = amount_elements[index];
            var valueSpan = amount_span.children[0];
            var unitSpan = amount_span.children[1];
            // Only scale numerical values
            if (typeof original_amount.value === 'number') {
                var scaledValue = original_amount.value * scaleFactor;
                // Check if we need to convert units
                if (unitSpan && original_amount.units) {
                    var bestMeasurement = amount_as_best_unit({ value: scaledValue, units: original_amount.units });
                    scaledValue = bestMeasurement.value;
                    unitSpan.textContent = bestMeasurement.units;
                }
                valueSpan.textContent = formatNumber(scaledValue);
            }
        });
    }
    // Add event listener to the input
    pancakeCountInput.addEventListener('change', updateValues);
    pancakeCountInput.addEventListener('input', updateValues);
    // Initial update
    updateValues();
});

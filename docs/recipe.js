document.addEventListener('DOMContentLoaded', function () {
    var amount_elements = [];
    var original_amounts = [];
    document.querySelectorAll('.amount').forEach(function (amount_span) {
        var amount = html_to_amount(amount_span);
        if (amount) {
            amount_elements.push(amount_span);
            original_amounts.push(amount);
        }
    });
    var pancake_count_input = document.getElementById('pancake-count');
    pancake_count_input.addEventListener('change', update_values);
    pancake_count_input.addEventListener('input', update_values);
    // This is needed because if the user enters their own number of pancakes
    // into the input field, and then soft-refreshes the page, then the input
    // field will still contain their chosen value, but the values across the
    // page will reset to the 6-pancake default, i.e., there will be a mismatch
    // which will be very confusing. (Hard-refreshing resets the input field as
    // well, but most users won't do that.)
    update_values();
    function html_to_amount(e) {
        var _a, _b, _c;
        if (!e) {
            console.log("Could not convert to amount", e);
            return null;
        }
        if (e.children.length != 2) {
            console.log("Could not convert to amount", e);
            return null;
        }
        var value_text = e.children[0].textContent || '';
        var value;
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
        var units = ((_c = (_b = (_a = e.children[1]) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || '';
        var amount = { value: value, units: units };
        return amount;
    }
    function amount_with_best_units(amount) {
        // Normalize units name - remove potential trailing 's'
        var originalUnits = amount.units.replace(/s$/, '');
        var units = originalUnits;
        // Only process known units
        if (!['cup', 'tbsp', 'tsp'].includes(units)) {
            return { value: amount.value, units: originalUnits };
        }
        if (units === 'cup' && amount.value < 2 * 1 / 48 + 0.01) {
            return { value: amount.value * 48, units: 'tsp' };
        }
        else if (units === 'cup' && amount.value < 0.2 + 0.01) {
            return { value: amount.value * 16, units: 'tbsp' };
        }
        else if (units === 'tbsp' && amount.value < 0.5 / 8) {
            return { value: amount.value * 3 * 98, units: 'drops' };
        }
        else if (units === 'tbsp' && amount.value < 0.5) {
            return { value: amount.value * 3, units: 'tsp' };
        }
        else if (units === 'tsp' && amount.value < 1 / 8 - 0.01) {
            return { value: amount.value * 98, units: 'drop' };
        }
        if (units === 'tsp' && amount.value >= 48) {
            return { value: amount.value / 48, units: 'cup' };
        }
        else if (units === 'tsp' && amount.value >= 3) {
            return { value: amount.value / 3, units: 'tbsp' };
        }
        else if (units === 'tbsp' && amount.value >= 8) {
            return { value: amount.value / 16, units: 'cup' };
        }
        return { value: amount.value, units: units };
    }
    function format_number(value) {
        if (Number.isInteger(value))
            return value.toString();
        // Handle common fractions for better readability
        if (value.toFixed(1) == "0.5")
            return '1/2';
        if (Math.abs(value - 0.25) < 0.01)
            return '1/4';
        if (Math.abs(value - 0.75) < 0.01)
            return '3/4';
        if (Math.abs(value - 0.33) < 0.01)
            return '1/3';
        if (Math.abs(value - 0.67) < 0.01)
            return '2/3';
        if (Math.abs(value - 0.125) < 0.01)
            return '1/8';
        if (value < 0.01)
            return value.toFixed(3);
        if (value < 0.1)
            return value.toFixed(2);
        if (value < 1)
            return value.toFixed(1);
        return value.toFixed(1).replace(/\.0$/, '');
    }
    function format_units(amount) {
        // Units that should not be pluralized
        var noPluralize = ['tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l'];
        // Handle pluralization only for units that should be pluralized
        if (amount.value != 1 && !noPluralize.includes(amount.units)) {
            return amount.units + 's';
        }
        return amount.units;
    }
    function update_values() {
        var pancake_count = parseFloat(pancake_count_input.value);
        if (isNaN(pancake_count) || pancake_count <= 0) {
            return; // Don't update if invalid input
        }
        original_amounts.forEach(function (original_amount, index) {
            var amount_span = amount_elements[index];
            var value_span = amount_span.children[0];
            var units_span = amount_span.children[1];
            var scale = pancake_count / 6.0; // Base recipe is for 6 pancakes
            var best = amount_with_best_units({
                value: original_amount.value * scale,
                units: original_amount.units
            });
            value_span.textContent = format_number(best.value);
            units_span.textContent = format_units(best);
        });
    }
});

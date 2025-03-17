document.addEventListener('DOMContentLoaded', () => {
  type Amount = {
    value: number;
    units: string;
  };

  const amount_elements: HTMLElement[] = [];
  const original_amounts: Amount[] = [];
  document.querySelectorAll('.amount').forEach(amount_span => {
    const amount: Amount | null = html_to_amount(amount_span as HTMLElement);
    if (amount) {
      amount_elements.push(amount_span as HTMLElement);
      original_amounts.push(amount);
    }
  });

  const pancake_count_input = document.getElementById('pancake-count') as HTMLInputElement;

  pancake_count_input.addEventListener('change', update_values);
  pancake_count_input.addEventListener('input', update_values);

  function html_to_amount(e: HTMLElement): Amount | null {
    if (!e) {
      console.log("Could not convert to amount", e);
      return null;
    }
    if (e.children.length != 2) {
      console.log("Could not convert to amount", e);
      return null;
    }

    const value_text = e.children[0].textContent || '';
    let value: number;
    if (value_text.includes('/')) {
      const parts = value_text.split('/');
      const numerator = parseFloat(parts[0].trim());
      const denominator = parseFloat(parts[1].trim());
      value = numerator / denominator;
    } else if (value_text === 'half') {
      value = 0.5;
    } else if (!isNaN(parseFloat(value_text))) {
      value = parseFloat(value_text);
    } else {
      console.log("Could not convert to amount", e);
      return null;
    }

    const units = e.children[1]?.textContent?.trim()?.toLowerCase() || '';
    const amount = {value: value, units: units} as Amount;
    return amount;
  }

  function amount_with_best_units(amount: Amount): Amount {
    // Normalize units name - remove potential trailing 's'
    let originalUnits = amount.units.replace(/s$/, '');
    let units = originalUnits;

    // Only process known units
    if (!['cup', 'tbsp', 'tsp'].includes(units)) {
      return { value: amount.value, units: originalUnits };
    }

    if (units === 'cup' && amount.value < 2*1/48 + 0.01) {
      return {value: amount.value * 48, units: 'tsp'};
    } else if (units === 'cup' && amount.value < 0.2 + 0.01) {
      return {value: amount.value * 16, units: 'tbsp'};
    } else if (units === 'tbsp' && amount.value < 0.5) {
      return {value: amount.value * 3, units: 'tsp'};
    }

    if (units === 'tsp' && amount.value >= 48) {
      return {value: amount.value / 48, units: 'cup'};
    } else if (units === 'tsp' && amount.value >= 3) {
      return {value: amount.value / 3, units: 'tbsp'};
    } else if (units === 'tbsp' && amount.value >= 8) {
      return {value: amount.value / 16, units: 'cup'};
    }

    return { value: amount.value, units: units };
  }

  function format_number(value: number): string {
    if (Number.isInteger(value)) return value.toString();

    // Handle common fractions for better readability
    if (value.toFixed(1) == "0.5") return '1/2';
    if (Math.abs(value - 0.25) < 0.01) return '1/4';
    if (Math.abs(value - 0.75) < 0.01) return '3/4';
    if (Math.abs(value - 0.33) < 0.01) return '1/3';
    if (Math.abs(value - 0.67) < 0.01) return '2/3';
    if (Math.abs(value - 0.125) < 0.01) return '1/8';

    if (value < 0.01) return value.toFixed(3);
    if (value < 0.1) return value.toFixed(2);
    if (value < 1) return value.toFixed(1);
    return value.toFixed(1).replace(/\.0$/, '');
  }

  function format_units(amount: Amount): string {
    // Units that should not be pluralized
    const noPluralize = ['tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l'];

    // Handle pluralization only for units that should be pluralized
    if (amount.value != 1 && !noPluralize.includes(amount.units)) {
      return amount.units + 's';
    }
    return amount.units;
  }

  function update_values(): void {
    const pancake_count = parseFloat(pancake_count_input.value);
    if (isNaN(pancake_count) || pancake_count <= 0) {
      return; // Don't update if invalid input
    }

    original_amounts.forEach((original_amount: Amount, index) => {
      const amount_span = amount_elements[index];
      const value_span = amount_span.children[0];
      const units_span = amount_span.children[1];

      const scale = pancake_count / 6.0; // Base recipe is for 6 pancakes
      const best: Amount = amount_with_best_units({
        value: original_amount.value * scale,
        units: original_amount.units
      });
      value_span.textContent = format_number(best.value);
      units_span.textContent = format_units(best);
    });
  }
});

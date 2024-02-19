import { Spinner } from '../modules/spin/spin.js';
import { opts } from '../modules/spin/config.js';

export function isLoading(load = true) {
    const spinner1 = new Spinner(opts).spin(document.querySelector('.line_chart'));
    const spinner2 = new Spinner(opts).spin(document.querySelector('.table_chart tbody'));
    const spinner3 = new Spinner(opts).spin(document.querySelector('.indicator_chart span'));
    if (!load) {
        spinner1.stop();
        spinner2.stop();
        spinner3.stop();
    }
}
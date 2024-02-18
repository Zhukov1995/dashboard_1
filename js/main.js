const select = document.querySelector('.select');
const btn_apply = document.querySelector('.btn_apply');

Papa.parse("./data.csv", {
    download: true,
    skipEmptyLines: true,
    complete: function (results) {
        const data = results.data.map((item, index, array) => {
            if (index === 0) return;
            return {
                [array[0][0]]: item[0],
                [array[0][1]]: item[1],
                [array[0][2]]: item[2]
            }
        });
        data.shift();
        const data_xAxis = prepareDate(data);
        const data_series = prepareData(data);

        createMultiSelect(prepareRegion(data));
        createLineChart(data_xAxis, data_series);
        createTableChart(data);
        createIndicatorChart(data);
        btn_apply.addEventListener('click', () => {
            redrawLineChart(data_xAxis, data_series);
            redrawTableChart(data);
            createIndicatorChart(data);
        });
        document.querySelector('.item_second').addEventListener('click', () => {
            createLineChart(data_xAxis, data_series);
            createTableChart(data);
            createIndicatorChart(data);
        });
        console.log(data)
    }
});




function createLineChart(xAxis, series) {
    const root = document.documentElement;
    const style = getComputedStyle(root);

    const color = style.getPropertyValue('--color-text');

    Highcharts.chart(document.querySelector('.line-chart'), {
        chart: {
            backgroundColor: style.getPropertyValue('--widget-bg'),
            type: 'line'
        },
        title: {
            text: 'Динамикой значения показателя по годам',
            align: 'left',
            style: { color }
        },
        yAxis: {
            title: {
                text: 'Показатель',
                style: { color }
            },
            labels: {
                style: { color }
            }
        },
        xAxis: {
            categories: xAxis,
            labels: {
                style: { color }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            itemStyle: { color }
        },
        series: series,
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom',
                        itemStyle: {
                            color: 'red',
                            fontWeight: 'bold'
                        }
                    }
                }
            }]
        }

    });
}


// функция фильтрует и перерисовывает линейный график
function redrawLineChart(data_xAxis, data_series) {
    const selectRegions = document.querySelectorAll('.checked');
    const arrRegions = [];
    selectRegions.forEach(node => {
        arrRegions.push(node.childNodes[3].textContent);
    })
    const filterSeries = data_series.filter(i => arrRegions.includes(i.name))
    console.log(filterSeries)
    console.log(arrRegions)
    createLineChart(data_xAxis, filterSeries);
}

// создание таблицы
function createTableChart(data) {
    const tableBody = document.querySelector('.widget_table tbody');
    tableBody.innerHTML = '';
    data.forEach(item => {
        tableBody.innerHTML += `
                <tr>
                    <td>${item['Регион']}</td>
                    <td>${item['Год']}</td>
                    <td>${item['Показатель']}</td>
                </tr>
        `
    })
}
// перерисовка таблицы
function redrawTableChart(data) {
    const selectRegions = document.querySelectorAll('.checked');
    const arrRegions = [];
    selectRegions.forEach(node => {
        arrRegions.push(node.childNodes[3].textContent);
    })
    const filterData = data.filter(i => arrRegions.includes(i['Регион']));
    createTableChart(filterData);
}

function createIndicatorChart(data) {
    const value = document.querySelector('.widget_indicator span');
    const arrValueRUS = data.map(item => {
        if (item['Год'] == '2023') return Number(item['Показатель'])
    }).filter(Number);
    const middleValueRUS = arrValueRUS.reduce((acc, c) => acc + c, 0) / arrValueRUS.length;

    const selectRegions = document.querySelectorAll('.checked');
    const arrRegions = [];
    selectRegions.forEach(node => {
        arrRegions.push(node.childNodes[3].textContent);
    })
    const filterData = data.filter(i => arrRegions.includes(i['Регион']) && i['Год'] == '2023');
    const arrValueSelect = filterData.map(i => Number(i['Показатель']))
    const middleValueSelect = arrValueSelect.reduce((acc, c) => acc + c, 0) / arrValueSelect.length;
    console.log(middleValueRUS);
    console.log(middleValueSelect)

    value.textContent = arrValueSelect.length ? middleValueSelect.toFixed(2) : middleValueRUS.toFixed(2);
    if (middleValueSelect < middleValueRUS) {
        value.style.color = 'red';
    } else {
        value.style.color = 'green'
    }
}





// функция подготавливает данные по годам
function prepareDate(data) {
    const year = data.map(item => {
        return Number(item['Год'])
    })
    return Array.from(new Set(year).values());
}

// функция преобразовывает данные в нужный вид
function prepareData(data) {
    let my_data = data.map((item, i, arr) => {
        return {
            name: item['Регион'],
            data: arr.filter(el => el['Регион'] === item['Регион']).map(el => {
                return Number(el['Показатель']);
            })
        }
    })
    return my_data.reduce((result, item) => {
        return result.findIndex(el => el.name === item.name) !== -1 ? result : [...result, item];
    }, []);
}

// функция подготавливает список регионов
function prepareRegion(data) {
    let region = data.map(item => {
        return item['Регион']
    })
    return Array.from(new Set(region));
}



// функция создает и заполняет кастомный select
function createMultiSelect(regions) {
    const selectBtn = document.querySelector('.select-btn');
    const list = document.querySelector('.list-items');
    const data = ['', '', ...regions];

    data.forEach((region, index) => {
        if (index === 0) {
            list.innerHTML += `
            <li class="item_first" style="padding-left:10px;cursor:pointer;line-height:25px">Выбрать все</li>`;
        } else if (index === 1) {
            list.innerHTML += `
            <li class="item_second" style="padding-left:10px;cursor:pointer;line-height:25px">Очистить</li>`;
        } else {
            list.innerHTML += `
        <li class="item">
                <span class="checkbox"><img src="./images/check.svg" alt="checkbox"></span>
                <span class="item-text">${region}</span>
        </li>
    `;
        }

    });

    selectBtn.addEventListener('click', () => {
        selectBtn.classList.toggle('open');
    });

    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('checked');

            const checked = document.querySelectorAll('.checked');
            const btnText = document.querySelector('.btn-text');
            if (checked && checked.length > 0) {
                btnText.innerHTML = `${checked.length} Выбрано`;
            } else {
                btnText.innerHTML = 'Регион';
            }
        })
    })

    document.querySelector('.item_first').addEventListener('click', () => {
        document.querySelectorAll('.item').forEach(item => {
            item.classList.add('checked');

            const checked = document.querySelectorAll('.checked');
            const btnText = document.querySelector('.btn-text');
            if (checked && checked.length > 0) {
                btnText.innerHTML = `${checked.length} Выбрано`;
            } else {
                btnText.innerHTML = 'Регион';
            }
        })
    });

    document.querySelector('.item_second').addEventListener('click', () => {
        document.querySelectorAll('.item').forEach(item => {
            item.classList.remove('checked');
        })
        const btnText = document.querySelector('.btn-text');
        btnText.innerHTML = 'Регион';
    })
}




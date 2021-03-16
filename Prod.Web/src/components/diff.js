export default function diff(text1, text2) {
    
    //console.log(text1,text2);
    let table = '';
    let acc = [];

    function make_result(x, y, type, text){
        let result = { lineNumber1: y, lineNumber2: x, type: type, text: text };
        acc.push(result);
    }
   
    function get_diff(make_row, matrix, a1, a2, x, y) {
        if (x > 0 && y > 0 && a1[y - 1] === a2[x - 1]) {
            get_diff(make_row, matrix, a1, a2, x - 1, y - 1);
            make_row(x, y, ' ', a1[y - 1]);
        }
        else {
            if (x > 0 && (y === 0 || matrix[y][x - 1] >= matrix[y - 1][x])) {
                get_diff(make_row, matrix, a1, a2, x - 1, y);
                make_row(x, '', '+', a2[x - 1]);
            }
            else if (y > 0 && (x === 0 || matrix[y][x - 1] < matrix[y - 1][x])) {
                get_diff(make_row, matrix, a1, a2, x, y - 1);
                make_row('', y, '-', a1[y - 1]);
            }
            else {
                return;
            }
        }

    }

    function find_diff(a1, a2) {
        let matrix = new Array(a1.length + 1);
        let x;
        let y;
        for (y = 0; y < matrix.length; y++) {
            matrix[y] = new Array(a2.length + 1);

            for (x = 0; x < matrix[y].length; x++) {
                matrix[y][x] = 0;
            }
        }
        for (y = 1; y < matrix.length; y++) {
            for (x = 1; x < matrix[y].length; x++) {
                if (a1[y - 1] === a2[x - 1]) {
                    matrix[y][x] = 1 + matrix[y - 1][x - 1];
                }
                else {
                    matrix[y][x] = Math.max(matrix[y - 1][x], matrix[y][x - 1]);
                }
            }
        }
        get_diff(make_result, matrix, a1, a2, x - 1, y - 1);
    }

    find_diff(text1.split('\n'), text2.split('\n'));
    //return '<table class="diff_text">' + table + '</table>';
    return acc;


}


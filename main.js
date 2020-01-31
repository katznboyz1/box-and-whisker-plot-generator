console.log('Made by Harrison/Katznboyz (2020)')

function dataLine2JSON(string) {
    result = [{}, 0];
    try {
        status = 1;
        parsedData = {
            'title':'Error fetching title',
            'minimum':0,
            'maximum':0,
            'median':0,
            'Q1':0,
            'Q3':0
        };
        parsedData['title'] = string.split(':')[0];
        dataPointsStrings = string.split(':')[1].split(',');
        dataPointsNumbers = [];
        for (i = 0; i < dataPointsStrings.length; i++) {
            numberParsed = parseFloat(dataPointsStrings[i]);
            if (isNaN(numberParsed)) {
                status = 0;
            } else {
                dataPointsNumbers.push(numberParsed);
            }
        }
        parsedData['minimum'] = Math.min(...dataPointsNumbers);
        parsedData['maximum'] = Math.max(...dataPointsNumbers);
        parsedData['median'] = Median(dataPointsNumbers);
        parsedData['Q1'] = Quartile_25(dataPointsNumbers);
        parsedData['Q3'] = Quartile_75(dataPointsNumbers);
        result = [parsedData, status];
    } catch(e) {
        //do nothing
    }
    return result;
}

window.onload = function() {
    colorScheme = ['#ffffff', '#292929']; //background, foreground (hex)

    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');

    spacingDataOriginal = [10, 10, 50, 20] //margin_top, margin_bottom, chart_height, text_height
    maxScaleOriginal = 3;

    function drawLoop() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        ctx.fillStyle = colorScheme[0];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = canvas.width / 2000;
        textBoxData = document.getElementById('mainTextarea').value.split('\n');
        textBoxDataParsed = [];
        scale = (canvas.height / textBoxData.length) / Array_Sum(spacingDataOriginal);
        maxScale = maxScaleOriginal * (parseInt(document.getElementById('mainSlider').value) / 100);
        if (scale > maxScale) {
            scale = maxScale;
        }
        spacingData = [
            spacingDataOriginal[0] * scale,
            spacingDataOriginal[1] * scale,
            spacingDataOriginal[2] * scale,
            spacingDataOriginal[3] * scale
        ]
        totalHeight = Array_Sum(spacingData);
        for (row = 1; row <= textBoxData.length; row++) {
            ctx.strokeStyle = colorScheme[1]
            ctx.beginPath();
            ctx.moveTo(0, (row * totalHeight));
            ctx.lineTo(canvas.width, (row * totalHeight));
            ctx.stroke();
            currentRowParsedData = dataLine2JSON(textBoxData[row - 1]);
            ctx.font = String(spacingData[3]) + 'px __local__courier__new';
            if (parseInt(currentRowParsedData[1]) === 1) {
                middlePointForLines = spacingData[0] + (spacingData[2] / 2);
                maximumRange = currentRowParsedData[0]['maximum'] - currentRowParsedData[0]['minimum'];
                percentagesOfRanges = {};
                for (each in currentRowParsedData[0]) {
                    if (each != 'title') {
                        percentagesOfRanges[each] = (currentRowParsedData[0][each] - currentRowParsedData[0]['minimum']) / maximumRange;
                    }
                }
                topYCoordainate = (row - 1) * totalHeight;
                textTopOffset = spacingData[0] + spacingData[2]
                ctx.fillStyle = colorScheme[1]
                ctx.beginPath();
                ctx.moveTo((percentagesOfRanges['minimum'] * canvas.width), (topYCoordainate + middlePointForLines));
                ctx.lineTo((percentagesOfRanges['Q1'] * canvas.width), (topYCoordainate + middlePointForLines));
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo((percentagesOfRanges['Q1'] * canvas.width), (topYCoordainate + spacingData[1]))
                ctx.lineTo((percentagesOfRanges['Q1'] * canvas.width), (topYCoordainate + totalHeight - spacingData[1]))
                ctx.stroke()
                ctx.fillText(currentRowParsedData[0]['minimum'], (percentagesOfRanges['minimum'] * canvas.width), ((row - 1) * totalHeight) + textTopOffset); //fix text heights
                ctx.fillText(currentRowParsedData[0]['Q1'], (percentagesOfRanges['Q1'] * canvas.width) - ctx.measureText(currentRowParsedData[0]['Q1']).width, ((row - 1) * totalHeight) + textTopOffset);
                ctx.beginPath()
                ctx.moveTo((percentagesOfRanges['Q1'] * canvas.width), (topYCoordainate + spacingData[1]))
                ctx.lineTo((percentagesOfRanges['Q3'] * canvas.width), (topYCoordainate + spacingData[1]))
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo((percentagesOfRanges['Q1'] * canvas.width), (topYCoordainate + totalHeight - spacingData[1]))
                ctx.lineTo((percentagesOfRanges['Q3'] * canvas.width), (topYCoordainate + totalHeight - spacingData[1]))
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo((percentagesOfRanges['median'] * canvas.width), (topYCoordainate + spacingData[1]))
                ctx.lineTo((percentagesOfRanges['median'] * canvas.width), (topYCoordainate + totalHeight - spacingData[1]))
                ctx.stroke()
                ctx.fillText(currentRowParsedData[0]['median'], (percentagesOfRanges['median'] * canvas.width), ((row - 1) * totalHeight) + textTopOffset);
                ctx.beginPath();
                ctx.moveTo((percentagesOfRanges['Q3'] * canvas.width), (topYCoordainate + middlePointForLines));
                ctx.lineTo((percentagesOfRanges['maximum'] * canvas.width), (topYCoordainate + middlePointForLines));
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo((percentagesOfRanges['Q3'] * canvas.width), (topYCoordainate + spacingData[1]))
                ctx.lineTo((percentagesOfRanges['Q3'] * canvas.width), (topYCoordainate + totalHeight - spacingData[1]))
                ctx.stroke()
                ctx.fillText(currentRowParsedData[0]['Q3'], (percentagesOfRanges['Q3'] * canvas.width), ((row - 1) * totalHeight) + textTopOffset); //fix text heights
                ctx.fillText(currentRowParsedData[0]['maximum'], (percentagesOfRanges['maximum'] * canvas.width) - ctx.measureText(currentRowParsedData[0]['maximum']).width, ((row - 1) * totalHeight) + textTopOffset);
                ctx.fillText(currentRowParsedData[0]['title'], 0, ((row - 1) * totalHeight) + spacingData[3]);
            } else {
                ctx.fillStyle = colorScheme[1];
                ctx.fillText('Syntax error on line ' + String(row), 0, ((row - 1) * totalHeight) + spacingData[3]);
            }
        }
        window.requestAnimationFrame(drawLoop);
    }

    window.requestAnimationFrame(drawLoop);
}
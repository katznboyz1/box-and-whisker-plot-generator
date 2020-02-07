//print the author to the console
console.log('Made by Harrison/Katznboyz (2020)')

//function to parse a line of data in the text entry into json
function dataLine2JSON(string) {

    //set the result as [blank_json, exit_code] and keep the exit code as 0 (failed) until the program is successful
    result = [{}, 0];

    //main try catch for random errors
    try {

        //change the exit code to 1 (success) and wait for the program to change it back to 0 if something goes wrong
        status = 1;

        //set up the structure of the json but keep it empty for now
        parsedData = {
            'title':'Error fetching title', //title of the graph
            'minimum':0, //minimum number in the set
            'maximum':0, //maximum number in the set
            'median':0, //median of the set
            'Q1':0, //lower quartile of the set
            'Q3':0 //upper quartile of the set
        };

        //split the data to get the string before the colon which is the title
        parsedData['title'] = string.split(':')[0];

        //split the text to get the string after the colon which is the comma seperated values
        dataPointsStrings = string.split(':')[1].split(',');

        //array of the comma seperated values converted into integers
        dataPointsNumbers = [];

        //iterate through the values and make sure they are all valid numbers
        for (i = 0; i < dataPointsStrings.length; i++) {

            //parse the number and make sure its not NaN
            numberParsed = parseFloat(dataPointsStrings[i]);
            if (isNaN(numberParsed)) {

                //since the number is NaN set the status to failed
                status = 0;
            } else {

                //since the number isnt NaN then dont alter the status and add the number to the list
                dataPointsNumbers.push(numberParsed);
            }
        }

        //set the values for the json the function is returning
        parsedData['minimum'] = Math.min(...dataPointsNumbers);
        parsedData['maximum'] = Math.max(...dataPointsNumbers);
        parsedData['median'] = Median(dataPointsNumbers);
        parsedData['Q1'] = Quartile_25(dataPointsNumbers);
        parsedData['Q3'] = Quartile_75(dataPointsNumbers);

        //set the result as the json and the status
        result = [parsedData, status];

    //if there is a random error just ignore it and keep the exit code as 0
    } catch(e) {
        //do nothing
    }

    //return the data
    return result;
}

//when the window loads run the main program
window.onload = function() {

    //the color scheme for the graph [bg, fg] (hex)
    colorScheme = ['#ffffff', '#292929'];

    //get the canvas element
    canvas = document.getElementById('mainCanvas');

    //get the 2d drawable screen from the canvas element
    ctx = canvas.getContext('2d');

    //the unscaled spacing data that will later be scaled to the desired size [margin_top, margin_bottom, chart_height, text_height]
    spacingDataOriginal = [10, 10, 50, 20];

    //the maximum scale value that the items can be scaled to (ex: if it is 3 then the items cant be scaled more than 3x their original size)
    maxScaleOriginal = 3;

    //main draw loop
    function drawLoop() {

        //resize the canvas in case the window was resized
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        //set the background color for when the canvas is overdrawn
        ctx.fillStyle = colorScheme[0];

        //clear the previous items on the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //fill the canvas with the background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //get the data from the text box and split it line by line
        textBoxData = document.getElementById('mainTextarea').value.split('\n');

        //array of the parsed text box data
        textBoxDataParsed = [];

        //calculate the new scale
        scale = (canvas.height / textBoxData.length) / Array_Sum(spacingDataOriginal);

        //calculate the new maximum scale relative to the sliders value
        maxScale = maxScaleOriginal * (parseInt(document.getElementById('mainSlider').value) / 100);

        //if the scale is larger than the max scale then reassign it to the max scale
        if (scale > maxScale) {
            scale = maxScale;
        }

        //calculate the spacing data relative to the scale number (todo: make this an iterative section instead of hardcoded values)
        spacingData = [
            spacingDataOriginal[0] * scale,
            spacingDataOriginal[1] * scale,
            spacingDataOriginal[2] * scale,
            spacingDataOriginal[3] * scale
        ]

        //calculate the total height of the section by adding up all of the spacing data
        totalHeight = Array_Sum(spacingData);

        //iterate through all the rows
        for (row = 1; row <= textBoxData.length; row++) {

            //set the line color to the foreground color
            ctx.strokeStyle = colorScheme[1]

            //set the line width relative to the canvas width
            ctx.lineWidth = canvas.width / 500;

            //draw a seperator line for the row from one side of the screen to the other
            ctx.beginPath();
            ctx.moveTo(0, (row * totalHeight));
            ctx.lineTo(canvas.width, (row * totalHeight));
            ctx.stroke();

            //set the line width to be a bit smaller relative to the screen width
            ctx.lineWidth = canvas.width / 2000;

            //parse the data for the current row using the dataline2json function
            currentRowParsedData = dataLine2JSON(textBoxData[row - 1]);

            //set the canvas font to the font selected by the dropdown "[FONT_SIZE]px [FONT_FAMILY]"
            ctx.font = String(spacingData[3]) + 'px ' + String(document.getElementById('mainDropdown').value);

            //if the exit code of the line parsing function is 1 then proceed
            if (parseInt(currentRowParsedData[1]) === 1) {

                //calculate the y coordinate of the lines relative to the top of the row
                middlePointForLines = spacingData[0] + (spacingData[2] / 2);

                //calculate the distance between the maximum and minimum numbers in the data
                maximumRange = currentRowParsedData[0]['maximum'] - currentRowParsedData[0]['minimum'];

                //empty json data for the data converted to percentages
                percentagesOfRanges = {};

                //convert the data to percentages so that they can be drawn to the screen
                for (each in currentRowParsedData[0]) {

                    //if the key isnt title then calculate the data
                    if (each != 'title') {
                        percentagesOfRanges[each] = (currentRowParsedData[0][each] - currentRowParsedData[0]['minimum']) / maximumRange;
                    }
                }

                //calculate the top y coordinate of the row
                topYCoordainate = (row - 1) * totalHeight;

                //calculate the distance from the top of the row to the text
                textTopOffset = spacingData[0] + spacingData[2]

                //set the fill color to the foreground color
                ctx.fillStyle = colorScheme[1]

                //draw a horizontal line from the minimum to the lower quartile
                ctx.beginPath();
                ctx.moveTo((percentagesOfRanges['minimum'] * canvas.width), (topYCoordainate + middlePointForLines));
                ctx.lineTo((percentagesOfRanges['Q1'] * canvas.width), (topYCoordainate + middlePointForLines));
                ctx.stroke()

                //draw a vertical line at the lower quartile to form the left of the box
                ctx.beginPath()
                ctx.moveTo((percentagesOfRanges['Q1'] * canvas.width), (topYCoordainate + spacingData[1]))
                ctx.lineTo((percentagesOfRanges['Q1'] * canvas.width), (topYCoordainate + totalHeight - spacingData[1]))
                ctx.stroke()

                //draw text that says what the minimum value is
                ctx.fillText(currentRowParsedData[0]['minimum'], (percentagesOfRanges['minimum'] * canvas.width), ((row - 1) * totalHeight) + textTopOffset);

                //draw text that says what the lower quartile value is
                ctx.fillText(currentRowParsedData[0]['Q1'], (percentagesOfRanges['Q1'] * canvas.width) - ctx.measureText(currentRowParsedData[0]['Q1']).width, ((row - 1) * totalHeight) + textTopOffset);

                //draw the top and bottom horizontal lines from the lower quartile to the upper quartile to form the top and bottom of the box
                ctx.beginPath()
                ctx.moveTo((percentagesOfRanges['Q1'] * canvas.width), (topYCoordainate + spacingData[1]))
                ctx.lineTo((percentagesOfRanges['Q3'] * canvas.width), (topYCoordainate + spacingData[1]))
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo((percentagesOfRanges['Q1'] * canvas.width), (topYCoordainate + totalHeight - spacingData[1]))
                ctx.lineTo((percentagesOfRanges['Q3'] * canvas.width), (topYCoordainate + totalHeight - spacingData[1]))
                ctx.stroke()

                //draw a vertical line at the median
                ctx.beginPath()
                ctx.moveTo((percentagesOfRanges['median'] * canvas.width), (topYCoordainate + spacingData[1]))
                ctx.lineTo((percentagesOfRanges['median'] * canvas.width), (topYCoordainate + totalHeight - spacingData[1]))
                ctx.stroke()

                //draw text that says what the median value is
                ctx.fillText(currentRowParsedData[0]['median'], (percentagesOfRanges['median'] * canvas.width), ((row - 1) * totalHeight) + textTopOffset);

                //draw a horizontal line from the upper quartile to the maximum
                ctx.beginPath();
                ctx.moveTo((percentagesOfRanges['Q3'] * canvas.width), (topYCoordainate + middlePointForLines));
                ctx.lineTo((percentagesOfRanges['maximum'] * canvas.width), (topYCoordainate + middlePointForLines));
                ctx.stroke()

                //draw a vertical line at the upper quartile to form the right side of the box
                ctx.beginPath()
                ctx.moveTo((percentagesOfRanges['Q3'] * canvas.width), (topYCoordainate + spacingData[1]))
                ctx.lineTo((percentagesOfRanges['Q3'] * canvas.width), (topYCoordainate + totalHeight - spacingData[1]))
                ctx.stroke()

                //draw text that says what the upper quartile value is
                ctx.fillText(currentRowParsedData[0]['Q3'], (percentagesOfRanges['Q3'] * canvas.width), ((row - 1) * totalHeight) + textTopOffset);

                //draw text that says what the maximum value is
                ctx.fillText(currentRowParsedData[0]['maximum'], (percentagesOfRanges['maximum'] * canvas.width) - ctx.measureText(currentRowParsedData[0]['maximum']).width, ((row - 1) * totalHeight) + textTopOffset);

                //draw text that says what the title of the row is
                ctx.fillText(currentRowParsedData[0]['title'], 0, ((row - 1) * totalHeight) + spacingData[3]);
            
            //if the exit code of the function is anything but 1 (meaning a non success)
            } else {

                //set the fill color to the foreground color
                ctx.fillStyle = colorScheme[1];

                //draw text that says there is a syntax error
                ctx.fillText('Syntax error on line ' + String(row), 0, ((row - 1) * totalHeight) + spacingData[3]);
            }
        }

        //loop back to the beginning of the draw loop
        window.requestAnimationFrame(drawLoop);
    }

    //start the draw loop
    window.requestAnimationFrame(drawLoop);
}
function setup() {
  noCanvas();

  // Creating an input field
  let prompt = createInput('What is the fill() function?');
  prompt.style('width', '400px');

  // Buttons for searching and answering
  createButton('search').mousePressed(searchIt);
  createButton('answer').mousePressed(answer);

  // Paragraph to display results
  let resultsP = createP('');

  // When the 'search' button is pressed
  async function searchIt() {
    // Send a POST request to the '/api/similar' endpoint
    const response = await fetch('/api/similar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt.value(), n: 5 }),
    });
    const results = await response.json();

    // Format and display the results
    let output = '';
    for (let chunk of results) {
      output += `${chunk.text}<br>Score: ${chunk.similarity.toFixed(
        3
      )}<br><br>`;
    }
    resultsP.html(output);
  }

  // Function when the 'answer' button is pressed
  async function answer() {
    // Send a POST request to the '/api/query' endpoint
    const response = await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt.value(), n: 5 }),
    });
    const results = await response.json();
    console.log(results);

    // Format and display the answer and context
    let output = results.answer.join('');
    output += '<br><br>Context:<br><br>';
    for (let chunk of results.similarities) {
      output += `${chunk.text}<br>Score: ${chunk.similarity.toFixed(
        3
      )}<br><br>`;
    }
    resultsP.html(output);
  }
}

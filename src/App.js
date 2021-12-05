import React, { useState, useEffect } from "react";
import './App.css'

const App = () => {
  const [board, setBoard] = useState([]);
  const [difficultyStatus, setDifficultyStatus] = useState(0);
  const [validity, setValidity] = useState(null);
  const cols = ['A','B','C','D','E','F','G','H','I']
  const difficultyLevels = ['easy', 'medium',  'hard']

  useEffect(() => {
  getDifficulty('easy')
}, []);

  function getDifficulty(difficultyLevel) {
    fetch(`https://vast-chamber-17969.herokuapp.com/generate?difficulty=${difficultyLevel}`)
    .then((resp) => resp.json())
    .then((data) => {
      const dataObject = data?.puzzle
      var newArray = []
      for (const key in dataObject) {
        if (dataObject.hasOwnProperty(key)) {
            newArray.push({ keyMatch : key[0] , key : key, value : dataObject[key], index: Number(key[1]) - 1});
        }
      }
      var groupedPeople=groupArrayOfObjects(newArray,"keyMatch");
      let sortedArray = []
      for(let i = 0 ; i < cols.length ; i++){
          sortedArray.push(groupedPeople[`${cols[i]}`])
      }
        sortedArray = sortedArray?.map((v,i)=>{
          var newVal = [0,0,0,0,0,0,0,0,0]
          for (let index = 0; index < 9; index++) {
            if(v[index] && v[index]){
              newVal[v[index]?.index] =  Number(v[index]?.value)
            }
          }
          return newVal
        })
        setBoard(sortedArray)

    });
  }

  function groupArrayOfObjects(list, key) {
    return list.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  const handleUpdate = (value, iRow, iCol) => {
    if(Number(value.target.value) &&  Number(value.target.value) < 10){
      const newBoard = [...board];
      newBoard[iRow][iCol] = Number(value.target.value);
      setBoard(newBoard);
    } else{
      const newBoard = [...board];
      newBoard[iRow][iCol] = 0;
      setBoard(newBoard);
    }
  };

const capitalize = ([first, ...str]) =>{
    return [first?.toUpperCase(), ...str].join('')
}


const clearTable = () =>{
  var clear = [...board]
  clear = board.map(value =>{
    value = value.map(v=>{
      v = 0
      return v;
    })
    return value;
  })
  setBoard(clear)
}

const encodeBoard = (board) => board.reduce((result, row, i) => result + `%5B${encodeURIComponent(row)}%5D${i === board.length -1 ? '' : '%2C'}`, '')

const encodeParams = (params) => 
  Object.keys(params)
  .map(key => key + '=' + `%5B${encodeBoard(params[key])}%5D`)
  .join('&');


const solveBoard = () => {
  const data = {board}

fetch('https://sugoku.herokuapp.com/solve', {
  method: 'POST',
  body: encodeParams(data),
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})
  .then(response => response.json())
  .then(response => setBoard(response.solution))
  .catch(console.warn)
}

const validateBoard = () => {
  const data = {board}

fetch('https://sugoku.herokuapp.com/validate', {
  method: 'POST',
  body: encodeParams(data),
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})
  .then(response => response.json())
  .then(response => setValidity(response.status))
  .catch(console.warn)
}
 

  return (<>
    <div className="container"> 
    <div>
      {board.map((row, iRow) => {
        return (
          <div key={iRow}>
            {row.map((col, iCol) => {
              return (
                <input
                  type="number"
                  key={iCol}
                  value={col === 0 ? "" : String(col)}
                  onChange={(value) => handleUpdate(value, iRow, iCol)}
                />
              );
            })}
          </div>
        );
      })}
      </div>
      <div>
      <div className='difficultyStatus'>{setDifficultyStatus !== null && `Difficulty Level: ${capitalize(difficultyLevels[difficultyStatus])}`}</div>
    <div className='validity difficultyStatus'>{validity  && `\nValidity : ${capitalize(validity)}`}</div>
    </div>
    </div>
    <div className="buttonContainer">
      {difficultyLevels.map((v,i) => {
        return <button className="button button4" onClick={() => (getDifficulty(v), setDifficultyStatus(i), setValidity(null))}>
        {capitalize(v)}
      </button>
      })}
      <button className="button  button3" onClick={() => (clearTable(), setValidity(null))}>
        Clear
      </button>
      <button className="button  button2" onClick={() => validateBoard()}>
        Validate
      </button>
    </div>
    <div className="buttonContainer">
    <button className="button  button1" onClick={() => (solveBoard(), setValidity(null))}>
        Solve
    </button>
    </div>
    </>
  );
};


export default App;

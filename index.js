#!/usr/bin/env node

const fs = require('fs')
const prompt = require('prompt-sync')()
const csv = require('csv-parser')
const _ = require("lodash")

const answerRangeMax = 7
const answerRangeMiddle = Math.ceil(answerRangeMax / 2)

const questions = []
const dimensionAnswers = {
  EI: 0,
  SN: 0,
  TF: 0,
  JP: 0,
}

fs.createReadStream('questions.csv')
  .pipe(csv())
  .on('data', row => {
    questions.push(buildQuestionFromRow(row))
  })
  .on('end', runQuestionnaire)

function buildQuestionFromRow(row) {
  return {
    question: row['Question'],
    dimension: row['Dimension'],
    direction: row['Direction']
  }
}

function runQuestionnaire() {
  console.log('Discover Your Perspective')
  console.log('Complete the 7 min test and get a detailed report of your lenses on the world.')
  console.log(`Fill in a number between 1 and ${answerRangeMax}. 1 means the question doesn't resonate with you and ${answerRangeMax} means the question resonates with you fully.`)

  questionAndAnswers = questions.map(promptAndSaveAnswers)
  questionAndAnswers.map(calcDimensionAnswers)

  console.log(`Your perspective type is ${getFinalResult(dimensionAnswers)}`)
}

function promptAndSaveAnswers(question) {
  console.log(question.question)
  const answer = parseInt(prompt())
  return {
    ...question,
    answer
  }
}

const calcDimensionAnswers = questionAndAnswer => {
  dimensionAnswers[questionAndAnswer.dimension] += getDirectionFromAnswer(questionAndAnswer.answer, questionAndAnswer.direction)
}

const getDirectionFromAnswer = (answer, direction) => {
  if (answer > answerRangeMiddle) {
    return 1 * direction
  } else if (answer === answerRangeMiddle) {
    return 0
  } else if (answer < answerRangeMiddle) {
    return -1 * direction
  }
}

function getFinalResult(dimensionAnswers) {
  let finalResult = ''
  _.forOwn(dimensionAnswers, (direction, dimension) => {
    finalResult += (direction >= 1 ? dimension[1] : dimension[0])
  })
  return finalResult
}

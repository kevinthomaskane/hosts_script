const fs = require('fs')
const inquirer = require('inquirer')

const path = '/etc/hosts'
const staging = '10.150.92.10'
const dev = '127.0.0.1'

inquirer
  .prompt([
    {
      type: 'input',
      name: 'site',
      message: 'What is the name of the site?',
      default: null
    }
  ])
  .then(site => {
    // user input, this will handle a substring or full version of any URL in the hosts file
    const ui = site.site
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'option',
          message: 'Which would you like to do?',
          default: dev,
          choices: [
            'open site on ' + staging,
            'open site on ' + dev,
            'comment out the site'
          ]
        }
      ])
      .then(res => {
        // save the initial value of the hosts file in ogHost
        const ogHost = fs.readFileSync(path, 'utf8')
        // split it on the '.com' to determine which sites are commented out
        const splitHost = ogHost.split('.com')
        if (res.option === 'comment out the site') {
          inquirer
            .prompt([
              {
                type: 'list',
                name: 'env',
                message: 'Which environment',
                default: dev,
                choices: [staging, dev, 'both']
              }
            ])
            .then(res => {
              if (res.env === staging) {
                // loop through the array and look for string that starts with the staging port
                for (let i = 0; i < splitHost.length; i++) {
                  if (
                    splitHost[i].includes(staging) &&
                    splitHost[i].includes(ui)
                  ) {
                    if (!splitHost[i].includes('#')) {
                      const commentMeOut =
                        '\n#  ' + (splitHost[i] + '.com').trim()
                      let newHostFile = ogHost.replace(
                        new RegExp(splitHost[i] + '.com', 'g'),
                        commentMeOut
                      )
                      fs.writeFile(path, newHostFile, err => {
                        if (err === null) {
                          fs.readFile(path, 'utf-8', (err, file) => {
                            console.log(file)
                          })
                        }
                      })
                    }
                  }
                }
              }
              if (res.env === dev) {
                for (let i = 0; i < splitHost.length; i++) {
                  if (splitHost[i].includes(dev) && splitHost[i].includes(ui)) {
                    if (!splitHost[i].includes('#')) {
                      const commentMeOut =
                        '\n# ' + (splitHost[i] + '.com').trim()
                      let newHostFile = ogHost.replace(
                        new RegExp(splitHost[i] + '.com', 'g'),
                        commentMeOut
                      )
                      fs.writeFile(path, newHostFile, err => {
                        if (err === null) {
                          fs.readFile(path, 'utf-8', (err, file) => {
                            console.log(file)
                          })
                        }
                      })
                    }
                  }
                }
              } else {
                let targetValueStaging = (targetValueDev = '\n# ')
                let newHostFile = ogHost
                for (let i = 0; i < splitHost.length; i++) {
                  if (splitHost[i].includes(dev) && splitHost[i].includes(ui)) {
                    targetValueDev = '\n# ' + (splitHost[i] + '.com').trim()
                    newHostFile = newHostFile.replace(
                      new RegExp(splitHost[i] + '.com', 'g'),
                      targetValueDev
                    )
                  }
                  if (
                    splitHost[i].includes(staging) &&
                    splitHost[i].includes(ui)
                  ) {
                    targetValueStaging = '\n# ' + (splitHost[i] + '.com').trim()
                    newHostFile = newHostFile.replace(
                      new RegExp(splitHost[i] + '.com', 'g'),
                      targetValueStaging
                    )
                  }
                }
                fs.writeFile(path, newHostFile, err => {
                  if (err === null) {
                    fs.readFile(path, 'utf-8', (err, file) => {
                      console.log(file)
                    })
                  }
                })
              }
            })
        } else {
          //user input environment, options answer always comes back as 'open site on <port>' , so index 1 after the split gives me the port
          const uie = res.option.split('on ')[1]
          let newRevertValue,
            newTargetValue,
            initialTargetValue,
            initialRevertValue
          for (let i = 0; i < splitHost.length; i++) {
            if (splitHost[i].includes(ui) && splitHost[i].includes(uie)) {
              initialTargetValue = splitHost[i]
              newTargetValue = splitHost[i].replace('#', '')
            } else if (
              splitHost[i].includes(ui) &&
              !splitHost[i].includes(uie)
            ) {
              if (!splitHost[i].includes('#')) {
                initialRevertValue = splitHost[i]
                newRevertValue = '# ' + splitHost[i]
              }
            }
          }
          inquirer
            .prompt([
              {
                type: 'confirm',
                name: 'confirm',
                message: 'is ' + initialTargetValue + ' the correct site name?'
              }
            ])
            .then(res => {
              if (res.confirm) {
                let newHostFile = ogHost.replace(
                  new RegExp(initialTargetValue, 'g'),
                  newTargetValue
                )
                newHostFile.replace(
                  new RegExp(initialRevertValue, 'g'),
                  newRevertValue
                )
                fs.writeFile(path, newHostFile, function(err) {
                  if (err === null) {
                    fs.readFile(path, 'utf-8', (err, file) => {
                      console.log(file)
                    })
                  }
                })
              }
            })
        }
      })
  })

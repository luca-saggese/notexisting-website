import React, { useState } from 'react'
import { connect } from 'react-redux'
import FileInput from '../../others/input/file'
import TextArea from '../../others/input/textArea'
import { CPP } from '../../../actions/post'
import Perspective from 'perspective-api-client'

const perspective = new Perspective({
  apiKey: 'AIzaSyCck6P49AKbnKF-gujEbGfwWAlhKOCpA6Q',
})

const PostItMiddle = ({ postIt, session, dispatch }) => {
  let { username } = session
  let { fileChanged, desc, previewImg, filter, fileInput } = postIt

  let dp = (...args) => dispatch(CPP(...args))

  let fileChange = e => {
    e.preventDefault()
    dp('fileChanged', true)
    dp('fileInput', e.target.value)
    dp('clean', true)

    let reader = new FileReader(),
      file = e.target.files[0]
    dp('targetFile', file)

    reader.onload = e => dp('previewImg', e.target.result)
    reader.readAsDataURL(file)
  }

  let heckText = async textVal => {
    // var timer = Date.now()
    let result = await perspective.analyze({
      comment: { text: textVal },
      requestedAttributes: {
        TOXICITY: {},
        PROFANITY: {},
        SEVERE_TOXICITY: {},
        SEXUALLY_EXPLICIT: {},
        INSULT: {},
        FLIRTATION: {},
        IDENTITY_ATTACK: {},
      },
      languages: ['en'],
    })

    // normlize the data
    var cleaness = { text: textVal }
    for (let key in result.attributeScores) {
      if (result.attributeScores.hasOwnProperty(key)) {
        let el = result.attributeScores[key]
        if (el && el.summaryScore && el.summaryScore.value)
          cleaness[key] =
            parseInt((el.summaryScore.value * 100).toFixed(0)) || 0
      }
    }

    console.log(cleaness)
    // reply['time'] = Date.now() - timer
    // console.log(JSON.stringify(reply, null, 2))

    if (cleaness.FLIRTATION > 60) {
      dp('clean', true)
    } else if (cleaness.TOXICITY > 30) {
      dp('clean', true)
    } else if (cleaness.PROFANITY > 30) {
      dp('clean', true)
    } else if (cleaness.SEVERE_TOXICITY > 25) {
      dp('clean', true)
    } else if (cleaness.SEXUALLY_EXPLICIT > 30) {
      dp('clean', true)
    } else if (cleaness.INSULT > 30) {
      dp('clean', true)
    } else if (cleaness.IDENTITY_ATTACK > 25) {
      dp('clean', true)
    } else {
      dp('clean', false)
    }
  }

  const [timeout, setTimeoutState] = useState(0)
  let valueChange = e => {
    let text = e.target.value
    dp('clean', true)
    dp('desc', text)

    if (timeout) clearTimeout(timeout)
    setTimeoutState(
      setTimeout(() => {
        heckText(text)
      }, 800)
    )
  }

  return (
    <div className="i_p_main p_main" style={{ height: 296 }}>
      {// Show if image/file is selected
      fileChanged ? (
        <div>
          <div className="i_p_ta">
            <TextArea
              placeholder={`Say something nice, @${username}?`}
              value={desc}
              valueChange={valueChange}
              className="t_p_ta"
            />
          </div>
          <div className="i_p_img">
            <img src={previewImg} className={filter} />
          </div>
        </div>
      ) : (
        // If not show button to select
        <form
          className="post_img_form"
          method="post"
          encType="multipart/formdata"
        >
          <FileInput
            value={fileInput}
            fileChange={fileChange}
            label="Choose an image"
            labelClass="pri_btn"
          />
        </form>
      )}
    </div>
  )
}

const mapStateToProps = state => ({
  session: state.User.session,
  postIt: state.Post.postIt,
})

export default connect(mapStateToProps)(PostItMiddle)
export { PostItMiddle as PurePostItMiddle }

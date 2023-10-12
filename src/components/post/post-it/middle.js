import React, { useState } from 'react'
import { connect } from 'react-redux'
import FileInput from '../../others/input/file'
import TextArea from '../../others/input/textArea'
import { CPP } from '../../../actions/post'
import Status from './post-status'
import Perspective from 'perspective-api-client'
import Dropzone from 'react-dropzone'


const perspective = new Perspective({
  apiKey: 'AIzaSyCck6P49AKbnKF-gujEbGfwWAlhKOCpA6Q',
})

// var cl = new cloudinary.Cloudinary({ cloud_name: 'de5u4rmlg', secure: true })

const PostItMiddle = ({ postIt, session, dispatch }) => {
  let { username } = session
  let {
    fileChanged,
    clean,
    desc,
    imageSafe,
    previewImg,
    filter,
    fileInput,
  } = postIt

  let dp = (...args) => dispatch(CPP(...args))

  let imageLoad = file => {
    var cloudName = 'de5u4rmlg'
    var unsignedUploadPreset = 'x9b8qxth'
    var url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`
    var xhr = new XMLHttpRequest()
    var fd = new FormData()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

    xhr.onreadystatechange = function(a) {
      if (xhr.readyState == 4 && xhr.status == 200) {
        // File uploaded successfully
        let response = JSON.parse(xhr.responseText)
        let url = response.secure_url
        fetch(
          `https://api.sightengine.com/1.0/check.json?models=nudity,wad,offensive&api_user=444495086&api_secret=KPBB8CcEzbmXrUzyftiL&url=${url}`
        )
          .then(function(response) {
            return response.json()
          })
          .then(function(image_safety) {
            console.log(image_safety)
            if (image_safety) {
              if (image_safety.weapon > 0.5) {
                dp('imageSafe', 'weapons')
              } else if (image_safety.offensive.prob > 0.5) {
                dp('imageSafe', 'offensive content')
              } else if (image_safety.alcohol > 0.5) {
                dp('imageSafe', 'alcohol')
              } else if (image_safety.drugs > 0.5) {
                dp('imageSafe', 'drugs')
              } else if (image_safety.nudity.safe < 0.4) {
                dp('imageSafe', 'nudity')
              } else if (image_safety.nudity.partial > 0.5) {
                dp('imageSafe', 'partial nudity')
              } else {
                dp('imageSafe', false)
              }
            } else {
              dp('imageSafe', true)
            }
          })
      }
    }

    fd.append('upload_preset', unsignedUploadPreset)
    fd.append('tags', 'feed')
    fd.append('file', file)
    xhr.send(fd)
  }

  let _fileChange = files =>{
    fileChange({
      preventDefault: ()=>{},
      target:{files}
    })
  }

  let fileChange = e => {
    //e.preventDefault()
    dp('imageSafe', true)
    dp('fileChanged', true)
    dp('fileInput', e.target.value)
    dp('clean', true)

    let reader = new FileReader(),
      file = e.target.files[0]
    dp('targetFile', file)
    reader.onload = e => {
      dp('previewImg', e.target.result)
      imageLoad(file)
    }
    reader.readAsDataURL(file)
  }

  let newImage = e => {
    e.preventDefault()
    console.log('new image')
    dp('clean', true)
    dp('fileChanged', true)

    var request = new XMLHttpRequest()
    request.open(
      'GET',
      'http://54.252.242.202:5000/generate?' + Date.now(),
      true
    )
    request.responseType = 'blob'
    request.onload = function() {
      dp('clean', true)
      dp('fileChanged', true)
      var reader = new FileReader()
      dp('targetFile', request.response)
      reader.readAsDataURL(request.response)
      reader.onload = function(e) {
        // console.log('DataURL:', e.target.result);
        dp('previewImg', e.target.result)
        imageLoad(file)
      }
    }
    request.send()
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

    if (cleaness.PROFANITY > 80) {
      dp('clean', 'profane')
    } else if (cleaness.INSULT > 40) {
      dp('clean', 'insulting')
    } else if (cleaness.SEVERE_TOXICITY > 35) {
      dp('clean', 'really toxic')
    } else if (cleaness.TOXICITY > 35) {
      dp('clean', 'toxic')
    } else if (cleaness.IDENTITY_ATTACK > 35) {
      dp('clean', 'an identity attack')
    } else if (cleaness.SEXUALLY_EXPLICIT > 40) {
      dp('clean', 'sexual')
    } else if (cleaness.FLIRTATION > 95) {
      dp('clean', 'dirty')
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
      }, 300)
    )
  }
  const fileTypes = ["JPG", "PNG", "GIF"];
  return (
    <div className="i_p_main p_main" style={{ height: 315 }}>
      {// Show if image/file is selected
      fileChanged ? (
        <div>
          <div className="i_p_ta">
            <TextArea
              placeholder={`Say something nice, @${username}?`}
              value={desc}
              disabled={Boolean(imageSafe)}
              valueChange={valueChange}
              className="t_p_ta"
            />
          </div>
          <div>
            <Status text={desc} rating={clean} imageSafe={imageSafe}></Status>
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
           {/* <FileInput
            value={fileInput}
            fileChange={fileChange}
            label="Choose an image"
            labelClass="pri_btn"
          />  */}
          <Dropzone onDrop={_fileChange}>
            {({getRootProps, getInputProps}) => (
              <section>
                <div {...getRootProps()} style={{height: '100%', textAlign: 'center', paddingTop: 150}}>
                  <input {...getInputProps()} />
                  <div style={{height: 300}}>Drag 'n' drop some files here, or click to select files</div>
                </div>
              </section>
            )}
          </Dropzone>
          {/* <a onClick={newImage}>I don't have an image</a> */}
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

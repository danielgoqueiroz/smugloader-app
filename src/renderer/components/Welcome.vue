<template>
  <b-container>
    SmugDownloader
  </b-container>
</template>

<script>
import { on } from 'cluster'
var Path = require('path')
var fs = require('fs')
var Axios = require('axios')


export default {
  data () {
    return {
      text: '',
      configuration: {
        folder: 'D:/TesteSmug/'
      }
    }
  },
  methods: {
    saveImageTest() {
      var folderPath = Path.resolve('D:/TesteSmug');
      this.makeRecursiveDir(folderPath);
      const url = 'https://photos.smugmug.com/photos/i-TFtjbXm/1/X5/i-TFtjbXm-X5.jpg'
      const path = Path.resolve(folderPath, 'code.jpg')
      
      console.log(url)
      console.log(path)
      
      this.saveImageOnDisk(url, path);
    },
    saveImageOnDisk (url, path) {
        Axios.get(url, {
          responseType: 'arraybuffer'
        }).then(response => {
          const buffer = Buffer.from(response.data, 'base64');
          console.log(buffer)
          fs.writeFile(path, buffer, (err) => {
            if (err) {
              console.log(err)
            }
          })
        }).catch(ex => {
          console.error(ex);
        });
      },
    makeRecursiveDir (fullPath) {
      var folderPath = Path.resolve(fullPath)
      var basefolder = Path.resolve(this.configuration.folder)
      var folders = folderPath.split(basefolder)[1]
      console.log(folders)
      var foldersList = []
      if (folderPath.includes('\\')) {
        foldersList = folders.split('\\')
      } else {
        foldersList = folders.split('/')
      }
      foldersList = foldersList.filter((el) => {
          if (el.length > 0) {
            return el
          }
        })
      
      foldersList.forEach(folder => {
          var pathTree = Path.resolve(basefolder, folder) 
          fs.mkdir(pathTree, (err, result) => {
            if (err) {
              console.log(err)
            }
            if (result) {
              console.log(result)
            }
          });
          basefolder = pathTree
      })
    }
  },
  mounted () {
  }
}
</script>

<style lang="stylus"></style>

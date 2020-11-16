
pipeline {
    docker {
            image 'node:6-alpine'
            args '-p 3000:3000'
        }
    }
    environment {
        CI = 'true'
    }    
  tools {nodejs "node"}
    
  stages {
        
    stage('Git') {
      steps {
        git 'https://OuissalTAIM@bitbucket.org/EndessBox/files_management.git'


      }
    }
     
    stage('Build') {
      steps {
        sh 'npm install'
         sh 'npm run test'
      }
    }  
    
            
    stage('Test') {
      steps {
        sh 'npm run tests'
      }
    }
  }
}
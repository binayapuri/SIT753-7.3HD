pipeline {
  agent any

  tools { nodejs 'NodeJS_16' }

  environment {
    SONAR_TOKEN = credentials('sonar-token')
    SNYK_TOKEN  = credentials('snyk-token')
    MONGO_URI   = credentials('mongo-atlas-uri')
  }

  stages {
    stage('Build') {
      steps { sh 'npm install' }
    }
    stage('Test') {
      steps { sh 'npm test' }
    }
    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('MySonarQube') {
          sh 'sonar-scanner -Dsonar.login=$SONAR_TOKEN'
        }
      }
    }
    stage('Security Scan') {
      steps {
        sh 'npm install -g snyk'
        sh 'snyk auth $SNYK_TOKEN'
        sh 'snyk test --severity-threshold=high'
      }
    }
    stage('Docker Build & Push') {
      steps {
        sh "docker build -t expense-app:${BUILD_NUMBER} ."
      }
    }
    stage('Deploy to Staging') {
      steps {
        sh 'docker-compose up -d'
      }
    }
    stage('Release') {
      steps {
        script {
          def tag = "v1.${env.BUILD_NUMBER}"
          sh "git tag ${tag}"
          sh "git push origin ${tag}"
        }
      }
    }
    stage('Monitor') {
      steps {
        echo '✅ Done! (You could integrate Prometheus/Grafana here.)'
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}

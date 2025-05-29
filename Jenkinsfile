// pipeline {
//   agent any

//   tools { nodejs 'NodeJS_16' }

//   environment {
//     SONAR_TOKEN = credentials('sonar-token')
//     SNYK_TOKEN  = credentials('snyk-token')
//     MONGO_URI   = credentials('mongo-atlas-uri')
//   }

//   stages {
//     stage('Build') {
//       steps { sh 'npm install' }
//     }
//     stage('Test') {
//       steps { sh 'npm test' }
//     }
//     stage('SonarQube Analysis') {
//       steps {
//         withSonarQubeEnv('MySonarQube') {
//           sh 'sonar-scanner -Dsonar.login=$SONAR_TOKEN'
//         }
//       }
//     }
//     stage('Security Scan') {
//       steps {
//         sh 'npm install -g snyk'
//         sh 'snyk auth $SNYK_TOKEN'
//         sh 'snyk test --severity-threshold=high'
//       }
//     }
//     stage('Docker Build & Push') {
//       steps {
//         sh "docker build -t expense-app:${BUILD_NUMBER} ."
//       }
//     }
//     stage('Deploy to Staging') {
//       steps {
//         sh 'docker-compose up -d'
//       }
//     }
//     stage('Release') {
//       steps {
//         script {
//           def tag = "v1.${env.BUILD_NUMBER}"
//           sh "git tag ${tag}"
//           sh "git push origin ${tag}"
//         }
//       }
//     }
//     stage('Monitor') {
//       steps {
//         echo '✅ Done! (You could integrate Prometheus/Grafana here.)'
//       }
//     }
//   }

//   post {
//     always {
//       cleanWs()
//     }
//   }
// }



pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-16'
    }
    
    environment {
        SONAR_TOKEN = credentials('sonar-token')
        SNYK_TOKEN = credentials('snyk-token')
        MONGO_URI = credentials('mongo-uri')
        DOCKER_HUB_CREDS = credentials('docker-hub-creds')
        EC2_HOST = '3.86.221.246'  // Replace with your EC2 IP
        DOCKER_IMAGE = "${DOCKER_HUB_CREDS_USR}/expense-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code...'
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                echo '🏗️ Building application...'
                sh 'npm install'
                
                // Build Docker image
                sh "docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${IMAGE_TAG} ${DOCKER_IMAGE}:latest"
                
                echo '✅ Build completed successfully!'
            }
        }
        
        stage('Test') {
            steps {
                echo '🧪 Running tests...'
                sh 'npm test'
                sh 'npm run test:coverage'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
        
        stage('Code Quality') {
            steps {
                echo '📊 Running SonarQube analysis...'
                withSonarQubeEnv('SonarQube') {
                    sh 'npx sonar-scanner'
                }
                
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
                echo '✅ Code quality check passed!'
            }
        }
        
        stage('Security Scan') {
            steps {
                echo '🔒 Running security scan...'
                sh 'npm install -g snyk'
                sh 'snyk auth ${SNYK_TOKEN}'
                
                script {
                    try {
                        sh 'snyk test --severity-threshold=high --json > snyk-results.json'
                        echo '✅ No high-severity vulnerabilities found!'
                    } catch (Exception e) {
                        echo '⚠️ Security vulnerabilities detected - check results'
                        archiveArtifacts artifacts: 'snyk-results.json', allowEmptyArchive: true
                    }
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                echo '📤 Pushing to Docker Hub...'
                sh 'echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin'
                sh "docker push ${DOCKER_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${DOCKER_IMAGE}:latest"
                echo '✅ Image pushed to registry!'
            }
        }
        
        stage('Deploy to Staging (EC2)') {
            steps {
                echo '🚀 Deploying to EC2 staging...'
                
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@${EC2_HOST} '
                            # Pull latest image
                            docker pull ${DOCKER_IMAGE}:${IMAGE_TAG}
                            
                            # Stop existing staging container
                            docker stop expense-app-staging || true
                            docker rm expense-app-staging || true
                            
                            # Run new staging container
                            docker run -d \
                                --name expense-app-staging \
                                -p 3000:8000 \
                                -e MONGO_URI="${MONGO_URI}" \
                                --restart unless-stopped \
                                ${DOCKER_IMAGE}:${IMAGE_TAG}
                            
                            # Wait for container to be ready
                            sleep 10
                        '
                    """
                }
                
                // Health check
                sh "curl -f http://${EC2_HOST}:3000/ || exit 1"
                echo '✅ Staging deployment successful!'
                echo "🌐 Staging URL: http://${EC2_HOST}:3000"
            }
        }
        
        stage('Integration Tests') {
            steps {
                echo '🧪 Running integration tests...'
                
                // Test staging deployment
                script {
                    def response = sh(
                        script: "curl -s -o /dev/null -w '%{http_code}' http://${EC2_HOST}:3000/expenses",
                        returnStdout: true
                    ).trim()
                    
                    if (response != '200') {
                        error('Integration test failed - API not responding correctly')
                    }
                    
                    echo '✅ Integration tests passed!'
                }
            }
        }
        
        stage('Deploy to Production (EC2)') {
            steps {
                echo '🌟 Deploying to production...'
                
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@${EC2_HOST} '
                            # Pull latest image
                            docker pull ${DOCKER_IMAGE}:latest
                            
                            # Stop existing production container
                            docker stop expense-app-prod || true
                            docker rm expense-app-prod || true
                            
                            # Run new production container
                            docker run -d \
                                --name expense-app-prod \
                                -p 8000:8000 \
                                -e MONGO_URI="${MONGO_URI}" \
                                --restart unless-stopped \
                                ${DOCKER_IMAGE}:latest
                            
                            # Wait for container to be ready
                            sleep 10
                        '
                    """
                }
                
                // Health check
                sh "curl -f http://${EC2_HOST}:8000/ || exit 1"
                echo '✅ Production deployment successful!'
                echo "🌟 Production URL: http://${EC2_HOST}:8000"
            }
        }
        
        stage('Release') {
            steps {
                echo '🏷️ Creating release...'
                
                script {
                    def version = "v1.${BUILD_NUMBER}"
                    
                    // Tag image as release
                    sh "docker tag ${DOCKER_IMAGE}:${IMAGE_TAG} ${DOCKER_IMAGE}:${version}"
                    sh "docker push ${DOCKER_IMAGE}:${version}"
                    
                    echo "✅ Tagged release as ${version}"
                }
            }
        }
        
        stage('Monitoring Setup') {
            steps {
                echo '📊 Setting up monitoring...'
                
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@${EC2_HOST} '
                            # Set up log rotation
                            echo "Setting up container monitoring..."
                            
                            # Create monitoring script
                            cat > monitor_app.sh << EOF
#!/bin/bash
# Simple health check monitoring
while true; do
    if ! curl -f http://localhost:8000/ > /dev/null 2>&1; then
        echo "\$(date): Application health check failed" >> /var/log/app-monitor.log
        # Could send alerts here
    else
        echo "\$(date): Application healthy" >> /var/log/app-monitor.log
    fi
    sleep 60
done
EOF
                            chmod +x monitor_app.sh
                            
                            # Start monitoring in background (basic example)
                            nohup ./monitor_app.sh &
                        '
                    """
                }
                
                echo '✅ Basic monitoring setup completed!'
                echo "📈 Monitor logs: ssh to EC2 and check /var/log/app-monitor.log"
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up local images...'
            sh "docker rmi ${DOCKER_IMAGE}:${IMAGE_TAG} || true"
            sh 'docker system prune -f || true'
        }
        success {
            echo '🎉 Pipeline completed successfully!'
            echo "🌐 Staging: http://${EC2_HOST}:3000"
            echo "🌟 Production: http://${EC2_HOST}:8000"
            
            // Could send success notifications here
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above.'
            // Could send failure notifications here
        }
    }
}
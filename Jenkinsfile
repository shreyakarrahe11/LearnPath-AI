pipeline {
	agent any

	stages {

		stage('Checkout') {
			steps {
				checkout scm
			}
		}
		stage('Build') {
			steps {
				echo 'Building LearnPath-AI...'
			}
		}
		stage('Test') {
			steps {
				echo 'Testing LearnPath-AI...'
			}
		}
		stage('Complete') {
			steps {
				echo 'LearnPath-AI CI Pipeline Completed Successfully!'
			}
		}
	}
}

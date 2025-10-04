new Vue({
    el:'#app',
    data:{
        activeTab:'login',
        loginForm:{
            email:'',
            password:''
        },
        signupForm:{
            name:'',
            email:'',
            password:'',
            confirmPassword:''
        },
        errors:{
            loginEmail:'',
            loginPassword:'',
            signupName:'',
            signupEmail:'',
            signupPassword:'',
            signupConfirm:'',
        },
        message:{
            text:'',
            type:''
        },
        isLoading: false,
        userCount:12548,
        showUserCount: true,
        passwordStrength:{
            class:'weak',
            text:'Weak'
        },
        //array of form validation rules
        validationRules:{
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            password:/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(a-zA-Z0-9!@#$%^&*){6,}$/
        },
    },
    computed:{
        //to check if login is valid
        isLoginFormValid: function(){
            return this.loginForm.email && this.loginForm.password && this.loginForm.password.length >=6 && this.isValidEmail(this.loginForm.email);
        },
        //to check if sign up is valid
        isSignupFormValid: function(){
            return this.signupForm.email && this.signupForm.password && this.signupForm.confirmPassword && this.loginForm.password.length >=6 && this.loginForm.password === this.signupForm.confirmPassword  &&this.isValidEmail(this.loginForm.email);
        },

        //get form status message
        formStatus: function(){
            if (this.activeTab === 'login'){
                return this.isLoginFormValid ? 'Ready to sign in!' : 'Please complete all fields correctly';
            }else{
                return this.isSignupFormValid ? 'Ready to sign in!' : 'Please complete all fields correctly';
            }
        },

        //get form status class
        formStatusClass: function(){
            if (this.activeTab === 'login'){
                return this.isLoginFormValid ? 'info' : 'warning';
            }else{
                return this.isSignupFormValid ? 'info' : 'warning';
            }
        }
    },
    methods:{
        // switch between login and signup tabs
        switchTab: function(tab){
            this.activeTab=tab;
            this.clearErrors();
            this.clearMessage();
        },
        //clear all error messages
        clearErrors: function(){
            for (let error in this.errors){
                this.errors[error]='';
            }
        },
        //clear specific error field
        clearError: function(){
            this.errors[field]='';
        },
        //clear message
        clearMessage: function(){
            this.message.text='';
            this.message.type='';
        },

        //validate email format
        isValidEmail: function(email){
            return this.validationRules.email.test(email);
        },

        //validate individual field
        validateField: function(){
            switch(field){
                case 'loginEmail':
                    if(!this.loginForm.email){
                        this.errors.loginEmail='Email is required';
                    } else if (!this.isValidEmail(this.loginForm.email)){
                        this.errors.loginEmail='Please enter a valid email address';
                    }
                    break;
                case 'loginPassword':
                    if(!this.loginForm.password){
                        this.errors.loginPassword='Password is required';
                    } else if (this.loginForm.password.length < 6){
                        this.errors.loginEmail='Password must be atleast 6 characters';
                    }
                    break; 
                case 'signupName':
                    if(!this.signupForm.name){
                        this.errors.lsignupName='Full name is required';
                    } else if (this.loginForm.name.length < 2){
                        this.errors.signupName='Name must be atleast 2 characters';
                    }
                    break;    
                case 'signupEmail':
                    if(!this.signupForm.email){
                        this.errors.signupEmail='Email is required';
                    } else if (!this.isValidEmail(this.signupForm.email)){
                        this.errors.signupEmail='Please enter a valid email adress';
                    }
                    break;
                case 'signupPassword':
                    if(!this.signupForm.password){
                        this.errors.signupEmail='Password is required';
                    } else if (!this.isValidEmail(this.signupForm.email)){
                        this.errors.signupEmail='Please enter a valid email adress';
                    }
                    break;         
            }
        },

    }
});
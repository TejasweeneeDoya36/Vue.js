//manage login and signup
new Vue({
    el:'#app',
    data:{
        //Current active tab
        activeTab:'login',
        //store login form data
        loginForm:{
            email:'',
            password:''
        },
        //store signup form data
        signupForm:{
            name:'',
            email:'',
            password:'',
            confirmPassword:''
        },
        errors:{},
        message:{
            text:'',
            type:'' //success or error
        },
        //to show or hide loading spinner
        isLoading: false,
        //counter for total number of registered users
        userCount:0,
        showUserCount: true,
        //to track password strength
        passwordStrength:{
            class:'weak',
            text:'Weak'
        },
        //array of form validation rules
        validationRules:{
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            password:/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/
        },
        passwordCheckTimeout:null
    },
    //for reactive values that update automatically
    computed:{
        //to check if login is valid
        isLoginFormValid: function(){
            const {email,password} = this.loginForm;
            return password.length >=6 && this.isValidEmail(email); //return True/False
        },
        //to check if sign up is valid
        isSignupFormValid: function(){
            const {name,email,password,confirmPassword} = this.signupForm;
            //return True/False
            return password.length >=6 && password === confirmPassword  && this.isValidEmail(email) && name.trim().length >=2;
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
           this.errors={};
        },
        //clear message
        clearMessage: function(){
            this.message.text='';
            this.message.type='';
        },

        //validate email format
        isValidEmail: function(email){
            return this.validationRules.email.test(email.trim());
        },
        //display system message 
        showMessage: function(text,type){
            this.message.text=text;
            this.message.type=type;

            //autohide success messages after 5 seconds
            if (type === 'success'){
                setTimeout(()=>{
                    this.clearMessage();
                },5000); // for 5 seconds
            }
        },
        triggerPasswordCheck: function(){
            clearTimeout(this.passwordCheckTimeout);

            this.passwordCheckTimeout=setTimeout(()=>{
                this.checkPasswordStrength();
            },300);
        },
        //check password strength
        checkPasswordStrength: function(){
            //clear previous timeout to avoid multiple rapid executions
            clearTimeout(this.passwordCheckTimeout);
            const pw = this.signupForm.password;

            //if password is empty
            if (!pw){
                this.passwordStrength.class='weak';
                this.passwordStrength.text='Weak';
                return;
            }

            //use timeout to delay execution
            this.passwordCheckTimeout=setTimeout(()=>{
                //calculate strength score based on various criteria
            let strength=0;
            if(pw.length>=6) strength =strength + 1; //minimum length
            if(pw.length>=8) strength = strength + 1 ; // good length
            if(/[A-Z]/.test(pw)) strength=strength + 1; // contains uppercase
            if(/[0-9]/.test(pw)) strength=strength + 1; //contains numbers
            if(/[^A-Za-z0-9]/.test(pw)) strength=strength + 1; //contain special characters

            //determine strength level and update display properties 
            if (strength <= 2){
                this.passwordStrength.class='weak';
                this.passwordStrength.text='Weak';
            } else if (strength <= 4){
                this.passwordStrength.class='medium';
                this.passwordStrength.text='Medium';
            }else{
                this.passwordStrength.class='strong';
                this.passwordStrength.text='Strong';
            }
            },300);
        },

        // validate login form
        validateLogin: function(){
            const {email,password} = this.loginForm;
            this.clearErrors();

            //email validation
            if(!email){
                this.errors.loginEmail='Email is required';
            } else if (!this.isValidEmail(email)){
                this.errors.loginEmail='Please enter a valid email address';
            }

            //password validation
            if(!password){
                this.errors.loginPassword='Password is required';
            } else if (password.length < 6){
                this.errors.loginPassword='Password must be atleast 6 characters';
            }

            //return True/False
            return Object.keys(this.errors).length === 0;
        },

        //validate signup form
        validateSignup: function(){
            const {name,email,password,confirmPassword} = this.signupForm;
            this.clearErrors();

            //check if name is empty
            if(!name.trim()){
                this.errors.signupName='Full name is required';
            } 
            //check email
            if(!email.trim()){
                this.errors.signupEmail='Email is required';
            } else if (!this.isValidEmail(email)){
                this.errors.signupEmail='Please enter a valid email adress';
            }
            //check password
            if(!password){
                this.errors.signupPassword='Password is required';
            } else if (password.length < 6){
                    this.errors.signupPassword='Password must be atleast 6 characters';
            }
            //check if both password match
            if(!confirmPassword){
                this.errors.signupConfirm='Please confirm your password';
            } else if (password !== confirmPassword ){
                this.errors.signupConfirm='Password do not match';
            }
            return Object.keys(this.errors).length === 0;
        },

        //handle login form submission
        login: async function(){
            //only proceed if form validation is true
            if (this.validateLogin()){
                this.isLoading= true;
                try{
                    //send login request to backend API
                    const response = await fetch ("http://localhost:3000/api/login",{
                        method:"POST",
                        headers:{"Content-Type":"application/json"},
                        body: JSON.stringify({
                            email:this.loginForm.email,
                            password: this.loginForm.password
                        })
                    });

                    //parse response from server
                    const result = await response.json();
                    this.isLoading=false;

                    //if login is successful
                    if (result.success){
                        this.showMessage(`Welcome back, ${result.user.name}`,"success");
                        this.loginForm.password="";
                        //redirect user to main page
                        setTimeout(()=>{
                            window.location.href="../Vue.js/mainPageHTML.html";
                        },1000);
                    }else{
                        this.showMessage(data.message || "Login failed","error");
                    }
                }  catch(err){
                    this.isLoading=false;
                    console.error("Login error:",err);
                    this.showMessage("Network error. Please try again");
                }
            }
        },

        //handle signup form submission
        signup: async function(){
            //only proceed if form validation is true
            if (this.validateSignup()){
                this.isLoading= true;
                try{
                    //send data to backend signup route
                    const response = await fetch ("http://localhost:3000/api/signup",{
                        method: "POST",
                        headers:{"Content-Type":"application/json"},
                        body: JSON.stringify({
                            name: this.signupForm.name,
                            email:this.signupForm.email,
                            password: this.signupForm.password,
                            confirmPassword: this.signupForm.confirmPassword
                        })
                    });
                    //parse response from server
                    const result = await response.json();

                    if (response.ok){
                        //if sign up is successful
                        this.showMessage(`Signup successful! Welcome ${this.signupForm.name}`,"success");
                        this.fetchUserCount();
                        //reset form
                        this.signupForm={
                            name:"",
                            email:"",
                            password:"",
                            confirmPassword:""
                        };

                        //redirect user to main page
                        setTimeout(()=>{
                            window.location.href="../Vue.js/mainPageHTML.html";
                        },1500);
                    }else{
                        this.showMessage(result.message || "Signup failed. Try again", "error");
                    }
                }catch(error){
                    this.isLoading=false;
                    console.error("Signup error:",error);
                    this.showMessage("Network error.Please try again","error");
                }
            }else{
                this.showMessage("Fix the errors")
            }
        },

        //user count
        fetchUserCount: async function() {
            try{
                //fetch from backend API
                const response = await fetch('http://localhost:3000/api/user-count');

                if(!response.ok){
                    throw new Error('Failed to fetch user count');
                }
                //parse response from server
                const data= await response.json();
                if (data.success){
                    this.userCount = data.count;
                }
            } catch( err){
                console.warn('failed to fetch user count:',err.message);
            }
        },

        getSubtext:function(){
            return this.activeTab === 'login'
                ? 'Access your personalised dashboard and continue where you left off'
                : 'Create your account to explore our extensive library lessons';
        },

        showForgotPassword: function(){
            this.showMessage('Password reset feature coming soon','success');
        },

        showTerms: function(){
            this.showMessage('Terms of Service feature coming soon','success');
        },

        showPrivacy: function(){
            this.showMessage('Privacy policy feature coming soon','success');
        },

        //method to handle keypress events
        handleKeypress: function(event){
            //enter key to submit form
            if(event.key === 'Enter' && !event.shiftKey){
                if (this.activeTab === 'login' && this.isLoginFormValid){
                    this.login();
                }else if (this.activeTab === 'signup' && this.isSignupFormValid){
                    this.signup();
                }
            }

            //escape key to clear messages
            if(event.key === 'Escape'){
                this.clearMessage();
            }
        }
    },

    //lifecycle hook
    mounted: function(){
        console.log('Vue application mounted successfully');

        //global press listener
        document.addEventListener('keypress',this.handleKeypress);
        //fetch initial user count
        this.fetchUserCount();
        //slight delay
        setTimeout(()=>{
            this.showUserCount=true;
        },800);
    },

    beforeDestroy:function(){
        // clean up event listeners to prevent memory leaks
        document.removeEventListener('keypress',this.handleKeypress);
    }
});
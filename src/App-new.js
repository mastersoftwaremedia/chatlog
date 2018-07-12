import React, {Component} from 'react'
import Moment from 'react-moment';
import {fire, GoogleProvider} from 'firebase'

class App extends Component{
	state={
		currentMessage:'', username:'', 
		email:'', password:'', error:{message:''},
		messages:[], user:null, 
		avatar:'/avatar.png',
		editing:false, loading:false
	}
	componentWillMount=()=>{
		firebase.auth().onAuthStateChanged(user=>{
			if(user){
				firebase.database().ref('messages').orderByKey().on('value',snap=>{
					let messages=snap.val()
					let newMessages=[]
					for(let message in messages){
						newMessages.push({
							id:message,
							time:messages[message].time,
							title:messages[message].title,
							user:messages[message].user,
						})
					}
					this.setState({messages:newMessages,user:user})
				})
			}else{
				this.setState({user:null, error:{message:null}})
			}
		})
	}
	
	logout=()=>{
		firebase.auth().signOut()
		.then((user)=>{this.setState({messages:null,user:null})})
	}
	googleLogin=()=>{
		firebase.auth().signInWithRedirect(GoogleProvider)
		.then(result=>{
			const user=result.user
			this.setState({user:user})
		})
		.catch(error=>console.log(error))
	}
  EmailAndPasswordAuthentication=e=>{
    e.preventDefault()
    const email = this.state.email
    const password = this.state.password
    firebase.auth().fetchProvidersForEmail(email)
		.then(provider => {
			if(provider.length > 0){
				return firebase.auth().signInWithEmailAndPassword(email, password)
				.catch(error=>this.setState({error}))
      } else {
        console.log(provider)
        return firebase.auth().createUserWithEmailAndPassword(email, password)
				.catch(error=>this.setState({error}))
      }
    })
		this.setState({
			email:'', password:''
		})
  }	
	
	handleChange=e=>{
		this.setState({[e.target.name]: e.target.value})
	}
	handleAdd=e=>{
		e.preventDefault()
		const message={
			time: new Date().getTime(),
			title:this.state.currentMessage,
			user:this.state.user.displayName || this.state.user.email,
		}
		firebase.database().ref('messages').push(message)
		this.setState({
			currentMessage:'',
			username:'',
		})
	}
	
	handleRemove=messageId=>{
		firebase.database().ref(`/messages/${messageId}`).remove()
	}
	
	/*handleEdit=()=>{
		this.setState({editing:!this.state.editing})
	}
	handleUpdate=(messageId)=>{
		const message={
			time: new Date().getTime(),
			title:this.refs.newText.value,
			user:this.state.user.displayName || this.state.user.email,
			id:messageId
		}
		firebase.database().ref(`/messages/${messageId}`).update(message)
		this.setState({
			//currentMessage:'',
			//username:'',
			editing:false
		})
	}*/
	
	render(){
		console.log('user',this.state.user)
    if (this.state.loading) {
      return (
        <div style={{ textAlign: "center", position: "absolute", top: "25%", left: "50%" }}>
          <h3>Loading...</h3>
        </div>
      )
    }
		
		return(
			<div className="app">
				<header>
					<div className="wrapper">
						<h1 className="logo">Log Any Chat</h1>
						{this.state.user?
							<div className="wrapper-logout">
								<button 
									style={{margin:'25px',marginLeft:'0px'}} 
									className="btn btn-warning btn-lg btn-block"
									type="button"
									onClick={this.logout}>Log Out</button>
							</div>
							:									
							<div>
								<div className="wrapper-google">
									<button 
										style={{margin:'15px',marginLeft:'0px'}} 
										className="btn btn-warning btn-lg btn-block"
										type="button"
										onClick={this.googleLogin}>Google Login</button>
								</div>
								<div className="wrapper-form">
									<div style={{margin:'5px',width:'100%'}}>{this.state.error.message}</div>
									<div className="form-group" style={{margin:'5%'}}>
										<label style={{margin:'10px',marginLeft:'0px'}}>Email</label>
										<input className="form-control"
												style={{marginRight:'5px',padding:'10px'}}
												type="text" name="email" id="email"
												placeholder="Email"
												onChange={this.handleChange}
												value={this.state.email}/>
										<label style={{margin:'10px',marginLeft:'0px'}}>Password</label>
										<input className="form-control"
												style={{marginRight:'5px',padding:'10px'}}
												type="password" name="password" id="password"
												placeholder="Password"
												onChange={this.handleChange}
												value={this.state.password}/>
										
										<button style={{margin:'25px',marginLeft:'0px'}} 
												className="btn btn-primary btn-lg btn-block"
												type="button"
												onClick={this.EmailAndPasswordAuthentication}>
												Register | Login
										</button>

									</div>
								</div>
							</div>					
						}
					</div>
				</header>

				{this.state.user?
					<div className="container">
						<section className="add-item">
							<div>
								<textarea name="currentMessage" 
									style={{width:'100%'}}
									cols="200" rows="5"
									placeholder="Type Your Message..."
									onChange={this.handleChange}	
									value={this.state.currentMessage} />
								<button type="submit" onClick={this.handleAdd}
								style={{margin:'5px',marginLeft:'0px'}} 
								className="submit-btn btn btn-primary black-background btn-lg btn-block"
								>Submit</button>
							</div>
						</section>								
						<section className="display-item">
							<div id="display-item-wrapper">
								<ul>
								{this.state.messages.map(message=>{
									return(
									<li key={message.id}>
									{(message.user===this.state.user.displayName && this.state.user.photoURL)?
										<div>
											<div id="first">
												<div className="user-profile">
													<img className="user-profile" src={this.state.user.photoURL} alt="user profile img" />						
												</div>
												<span style={{border:'none',outline:'none',textTransform:'lowercase',fontSize:'0.8em'}}>
													{message.user}
												</span>
											</div>
											<div id="second">
												<Moment fromNow className="moment">{message.time}</Moment>
												<h5>{message.title}</h5>	
													{message.user===this.state.user.displayName || message.user===this.state.user.email?
													<div>
														<span  className="pointer" onClick={()=>this.handleRemove(message.id)}>[Remove]</span>
													</div>
														:
														null
													}
											</div>
										</div>
										:
										<div>
											<div id="first">
												<div className="user-profile">
													<img className="user-profile" src={this.state.avatar} alt="user profile img" />						
												</div>
												<span style={{border:'none',outline:'none',textTransform:'lowercase',fontSize:'0.8em'}}>
													{message.user}
												</span>					
											</div>
											<div id="second">
												<Moment fromNow className="moment">{message.time}</Moment>
												<h5>{message.title}</h5>	
													{message.user===this.state.user.displayName || message.user===this.state.user.email?
													<div>
														<span className="pointer" onClick={()=>this.handleRemove(message.id)}>[Remove]</span>
													</div>
														:
														null
													}
											</div>
										</div>
									}
									</li>

								)
								})}
							</ul>

						</div>
															
					</section>
				</div>
				:
				<div className="wrapper"></div>
				}
			</div>
		)
	}
}
export default App
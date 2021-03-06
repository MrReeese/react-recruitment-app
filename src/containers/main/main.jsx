/*
主页面路由组件
 */
import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import Boss from '../boss/boss'
import BossInfo from '../boss-info/boss-info'
import Jobseeker from '../jobseeker/jobseeker'
import JobseekerInfo from '../jobseeker-info/jobseeker-info'
import Message from '../message/message'
import Personal from '../personal/personal'
import NotFound from '../../components/not-found/not-found'
import { getRedirecUrl } from '../../utils/redirect-route'
import { getUserData } from '../../redux/actions'
import Cookies from 'js-cookie'
import NavTabs from '../../components/nav-tabs/nav-tabs'
import { NavBar, Toast } from 'antd-mobile'
import './main.less'
import Chat from '../chat/chat'

class Main extends Component {

  // 给组件类添加导航数据
  navList = [
    {
      path: '/boss',
      component: Boss,
      title: '求职者列表',
      icon: 'jobseeker',
      text: '求职列表'
    },
    {
      path: '/jobseeker',
      component: Jobseeker,
      title: '职位列表',
      icon: 'job',
      text: '职位列表'
    }
  ]

  publicNavList = [
    {
      path: '/message',
      component: Message,
      title: '消息管理',
      icon: 'message',
      text: '消息管理'
    },
    {
      path: '/personal',
      component: Personal,
      title: '个人中心',
      icon: 'person',
      text: '个人中心'
    },
  ]

  componentDidMount () {
    const userId = Cookies.get('userId')
    const { _id } = this.props.user
    if (userId && !_id) {
      // 发送登陆请求
      this.props.getUserData()

    }
  }

  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    const { isRequesting } = nextProps.user
    isRequesting ? Toast.loading('加载中...', 0) : Toast.hide()
  }


  render () {
    //导航守卫
    const userId = Cookies.get('userId')
    //如果cookie中userId不存在，重定向到登陆页面
    if (!userId) {
      return <Redirect to={'/login'}/>
    } else {
      const { user } = this.props
      //如果Redux中_id不存在，不显示任何数据
      if (!user._id) {
        return null
      } else {
        let path = this.props.location.pathname
        if (path === '/') { // 如果请求的根路径，则检查信息是否完善，再跳转
          path = getRedirecUrl(user.userType, user.avatar)
          return <Redirect to={path}/>
        }
      }
    }

    const { navList, publicNavList } = this
    const { user } = this.props
    let path = this.props.location.pathname
    const currentNavInfo = [...navList, ...publicNavList].find(item => item.path === path)
    const customNavTabs = [
      navList.find(item => item.path === `/${user.userType}`),
      ...publicNavList
    ]

    return (
      <div>
        {currentNavInfo ? <NavBar className="sticky-header">{currentNavInfo.title}</NavBar> : null}
        <Switch>
          {
            [...navList, ...publicNavList].map(item => (
              <Route key={item.path} path={item.path} component={item.component}/>
            ))
          }
          <Route path='/boss-info' component={BossInfo}/>
          <Route path='/jobseeker-info' component={JobseekerInfo}/>
          <Route path='/chat/:userId' component={Chat}/>
          <Route component={NotFound}/>
        </Switch>
        {currentNavInfo ? <NavTabs unreadMsgcount={this.props.unreadMsgcount} customNavtabs={customNavTabs}/> : null}

      </div>
    )
  }
}

export default connect(
  state => ({
    user: state.user,
    unreadMsgcount: state.chat.unreadMsgcount
  }),
  { getUserData }
)(Main)


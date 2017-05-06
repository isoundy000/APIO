import Api from '../../lib/api'
import moment from 'moment-timezone'
import Signature from './signature'

import {
  AliyunECS as AliyunECSConfig,
  System as SystemConfig
} from '../../config'

moment.locale(SystemConfig.System_country) // 设置当地时间格式

let signature = new Signature()

export default () => {
  console.log('阿里云ECS插件已加载')
}

const QueryURL = 'https://ecs-cn-hangzhou.aliyuncs.com' // 请求地址

export let List = async () => {
  let CommonParams = {
    Format: 'JSON', // 返回值的类型，支持JSON与XML。默认为XML
    Version: AliyunECSConfig.Version, // API版本号
    AccessKeyId: AliyunECSConfig.accessKeyId,
    SignatureMethod: 'HMAC-SHA1',
    Timestamp: moment().utc().format(), // 时间戳
    SignatureVersion: '1.0', // 签名算法版本，目前版本是1.0
    SignatureNonce: (Math.random() * 900000 | 100000).toString() // 唯一随机数，用于防止网络重放攻击。用户在不同请求间要使用不同的随机数值
    // RAM中要加上ResourceOwnerAccount
  }

  let pa = {
    Action: 'DescribeInstances', // 操作接口名，系统规定参数
    RegionId: 'cn-qingdao' // 地域
  }

  let params = Object.assign(CommonParams, pa)

  params.Signature = signature._getSignature('GET', params, AliyunECSConfig.accessKeySecret) // 签名结果字符串

  let result = null
  try {
    console.log(params)
    result = await Api.get(QueryURL, {
      params: params
    })
  } catch (err) {
    return {
      status: err.response.status,
      result: {
        errInfo: '请求错误！',
        errMessage: err.response.data
      }
    }
  }

  return result.data
}

import request from '@/utils/request'
import { mockPlayerList, mockPlayerDetail, mockPlayerRanking } from '@/mock/player'

export function getPlayerList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 1, pageSize = 10, keyword = '', status = '', level = '', game = '' } = params || {}
      let list = [...mockPlayerList]
      
      if (keyword) {
        list = list.filter(item => 
          item.username.includes(keyword) || 
          item.nickname.includes(keyword) ||
          item.realName.includes(keyword) ||
          item.phone.includes(keyword)
        )
      }
      
      if (status) {
        list = list.filter(item => item.status === status)
      }
      
      if (level) {
        list = list.filter(item => item.level === level)
      }
      
      if (game) {
        list = list.filter(item => item.games.includes(game))
      }
      
      const total = list.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const data = list.slice(start, end)
      
      resolve({
        code: 200,
        data: {
          list: data,
          total,
          page,
          pageSize
        }
      })
    }, 300)
  })
}

export function getPlayerDetail(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const player = mockPlayerList.find(p => p.id === parseInt(id))
      if (player) {
        resolve({
          code: 200,
          data: {
            ...mockPlayerDetail,
            ...player
          }
        })
      } else {
        resolve({
          code: 404,
          message: '打手不存在'
        })
      }
    }, 200)
  })
}

export function getPlayerRanking(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { period = 'month', game = '' } = params || {}
      let list = [...mockPlayerRanking]
      
      if (game) {
        list = list.slice(0, 5)
      }
      
      resolve({
        code: 200,
        data: list
      })
    }, 300)
  })
}

export function updatePlayerStatus(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockPlayerList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockPlayerList[index].status = data.status
      }
      resolve({
        code: 200,
        message: '状态更新成功'
      })
    }, 300)
  })
}

export function updatePlayer(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockPlayerList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockPlayerList[index] = { ...mockPlayerList[index], ...data }
      }
      resolve({
        code: 200,
        message: '更新成功'
      })
    }, 500)
  })
}

export function verifyPlayer(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockPlayerList.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockPlayerList[index].status = data.passed ? 'active' : 'rejected'
      }
      resolve({
        code: 200,
        message: data.passed ? '审核通过' : '审核不通过'
      })
    }, 500)
  })
}

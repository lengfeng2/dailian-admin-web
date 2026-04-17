import request from '@/utils/request'
import { 
  mockGameList, 
  mockCategoryList, 
  mockGameStatusMap, 
  mockGameCategoryMap,
  mockQuickOrderTemplates,
  mockGameStats
} from '@/mock/game'

export function getGameList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { 
        page = 1, 
        pageSize = 10, 
        keyword = '', 
        category = '', 
        status = '',
        hot = '',
        recommend = ''
      } = params || {}
      
      let list = [...mockGameList]
      
      if (keyword) {
        list = list.filter(item => 
          item.name.includes(keyword) || 
          item.description.includes(keyword)
        )
      }
      
      if (category) {
        list = list.filter(item => item.category === category)
      }
      
      if (status) {
        list = list.filter(item => item.status === status)
      }
      
      if (hot) {
        list = list.filter(item => item.hot === (hot === 'true'))
      }
      
      if (recommend) {
        list = list.filter(item => item.recommend === (recommend === 'true'))
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

export function getGameDetail(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const game = mockGameList.find(g => g.id === parseInt(id))
      if (game) {
        resolve({
          code: 200,
          data: game
        })
      } else {
        resolve({
          code: 404,
          message: '游戏不存在'
        })
      }
    }, 200)
  })
}

export function createGame(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = Math.max(...mockGameList.map(g => g.id)) + 1
      const newGame = {
        id: newId,
        ...data,
        playerCount: 0,
        orderCount: 0,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      mockGameList.push(newGame)
      resolve({
        code: 200,
        message: '游戏创建成功',
        data: newGame
      })
    }, 500)
  })
}

export function updateGame(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockGameList.findIndex(g => g.id === data.id)
      if (index !== -1) {
        Object.assign(mockGameList[index], data, {
          updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        })
        resolve({
          code: 200,
          message: '游戏更新成功'
        })
      } else {
        resolve({
          code: 404,
          message: '游戏不存在'
        })
      }
    }, 500)
  })
}

export function deleteGame(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockGameList.findIndex(g => g.id === parseInt(id))
      if (index !== -1) {
        mockGameList.splice(index, 1)
        resolve({
          code: 200,
          message: '游戏删除成功'
        })
      } else {
        resolve({
          code: 404,
          message: '游戏不存在'
        })
      }
    }, 300)
  })
}

export function toggleGameStatus(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockGameList.findIndex(g => g.id === data.id)
      if (index !== -1) {
        mockGameList[index].status = data.status
        mockGameList[index].updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
        resolve({
          code: 200,
          message: data.status === 'active' ? '游戏已启用' : '游戏已禁用'
        })
      }
    }, 300)
  })
}

export function toggleGameHot(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockGameList.findIndex(g => g.id === data.id)
      if (index !== -1) {
        mockGameList[index].hot = data.hot
        resolve({
          code: 200,
          message: data.hot ? '已设为热门' : '已取消热门'
        })
      }
    }, 300)
  })
}

export function toggleGameRecommend(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockGameList.findIndex(g => g.id === data.id)
      if (index !== -1) {
        mockGameList[index].recommend = data.recommend
        resolve({
          code: 200,
          message: data.recommend ? '已设为推荐' : '已取消推荐'
        })
      }
    }, 300)
  })
}

export function getCategoryList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { 
        page = 1, 
        pageSize = 10, 
        keyword = '', 
        status = ''
      } = params || {}
      
      let list = [...mockCategoryList]
      
      if (keyword) {
        list = list.filter(item => 
          item.name.includes(keyword) || 
          item.description.includes(keyword)
        )
      }
      
      if (status) {
        list = list.filter(item => item.status === status)
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

export function getCategoryDetail(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const category = mockCategoryList.find(c => c.id === parseInt(id))
      if (category) {
        resolve({
          code: 200,
          data: category
        })
      } else {
        resolve({
          code: 404,
          message: '代练类型不存在'
        })
      }
    }, 200)
  })
}

export function createCategory(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = Math.max(...mockCategoryList.map(c => c.id)) + 1
      const newCategory = {
        id: newId,
        ...data,
        gameCount: 0,
        orderCount: 0,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      mockCategoryList.push(newCategory)
      resolve({
        code: 200,
        message: '代练类型创建成功',
        data: newCategory
      })
    }, 500)
  })
}

export function updateCategory(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockCategoryList.findIndex(c => c.id === data.id)
      if (index !== -1) {
        Object.assign(mockCategoryList[index], data)
        resolve({
          code: 200,
          message: '代练类型更新成功'
        })
      } else {
        resolve({
          code: 404,
          message: '代练类型不存在'
        })
      }
    }, 500)
  })
}

export function deleteCategory(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockCategoryList.findIndex(c => c.id === parseInt(id))
      if (index !== -1) {
        mockCategoryList.splice(index, 1)
        resolve({
          code: 200,
          message: '代练类型删除成功'
        })
      } else {
        resolve({
          code: 404,
          message: '代练类型不存在'
        })
      }
    }, 300)
  })
}

export function toggleCategoryStatus(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockCategoryList.findIndex(c => c.id === data.id)
      if (index !== -1) {
        mockCategoryList[index].status = data.status
        resolve({
          code: 200,
          message: data.status === 'active' ? '代练类型已启用' : '代练类型已禁用'
        })
      }
    }, 300)
  })
}

export function getQuickOrderTemplates() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockQuickOrderTemplates
      })
    }, 200)
  })
}

export function calculateQuickOrderPrice(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { gameId, categoryId, currentRank, targetRank } = data
      const game = mockGameList.find(g => g.id === gameId)
      
      if (!game) {
        resolve({
          code: 400,
          message: '游戏不存在'
        })
        return
      }
      
      let basePrice = 0
      let estimatedTime = ''
      
      if (game.ranks && game.ranks.length > 0 && currentRank && targetRank) {
        const currentRankIndex = game.ranks.findIndex(r => r.name === currentRank)
        const targetRankIndex = game.ranks.findIndex(r => r.name === targetRank)
        
        if (currentRankIndex !== -1 && targetRankIndex !== -1 && targetRankIndex > currentRankIndex) {
          const currentRankData = game.ranks[currentRankIndex]
          const targetRankData = game.ranks[targetRankIndex]
          basePrice = targetRankData.minPrice
          estimatedTime = `${(targetRankIndex - currentRankIndex) * 2}天`
        }
      }
      
      if (basePrice === 0) {
        basePrice = Math.floor(Math.random() * 500) + 100
        estimatedTime = '1-2天'
      }
      
      const deposit = Math.floor(basePrice * 0.25)
      const serviceFee = Math.floor(basePrice * 0.05)
      const playerAmount = basePrice - deposit - serviceFee
      
      resolve({
        code: 200,
        data: {
          basePrice,
          deposit,
          serviceFee,
          playerAmount,
          estimatedTime,
          gameName: game.name,
          icon: game.icon
        }
      })
    }, 500)
  })
}

export function submitQuickOrder(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderNo = 'DL' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(Math.floor(Math.random() * 10000)).padStart(4, '0')
      resolve({
        code: 200,
        message: '订单创建成功',
        data: {
          orderNo,
          ...data
        }
      })
    }, 800)
  })
}

export function getGameStats() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockGameStats
      })
    }, 200)
  })
}

export function getAllGames() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockGameList.filter(g => g.status === 'active')
      })
    }, 200)
  })
}

export function getAllCategories() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockCategoryList.filter(c => c.status === 'active')
      })
    }, 200)
  })
}

export { 
  mockGameStatusMap, 
  mockGameCategoryMap,
  mockQuickOrderTemplates,
  mockGameList,
  mockCategoryList
}

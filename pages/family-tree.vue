<template>
  <div class="family-tree-container">
    <div class="canvas-wrapper" ref="containerRef">
      <svg class="lines-layer" ref="svgRef">
        <path v-for="(line, index) in lines" :key="index" :d="line.d" stroke="#CBD5E1" stroke-width="2" fill="none" stroke-linejoin="round" />
      </svg>

      <div class="tree-layout">
        <div class="generation-row" v-for="gen in sortedGenerations" :key="gen.level">
          <div class="node-group" v-for="group in gen.groups" :key="group.id">
            <div class="person" :class="[group.primary.gender, group.primary.isAlive ? 'alive' : 'dead', { 'is-me': group.primary.isMe, 'dummy': group.primary.isDummy }]" :id="'node-'+group.primary.id" @click="group.primary.isDummy ? null : openModal(group.primary)">
              <div v-if="group.primary.isMe" class="me-badge">我</div>
              <div class="name">{{ group.primary.name }}</div>
            </div>
            
            <div class="person spouse" v-for="spouse in group.spouses" :key="spouse.id" :class="[spouse.gender, spouse.isAlive ? 'alive' : 'dead', { 'dummy': spouse.isDummy, 'divorced': spouse.marriageStatus === 'divorced' }]" :id="'node-'+spouse.id" @click="spouse.isDummy ? null : openModal(spouse, group.primary)">
              <div v-if="spouse.marriageStatus === 'divorced'" class="divorced-badge">离异</div>
              <div class="name">{{ spouse.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" v-if="showModal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ getModalTitle() }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div class="modal-body" v-if="activeTab === 'actions'">
          <div class="action-grid">
            <button class="action-btn" @click="goToAdd('parent')">
              <span class="emoji">⬆️</span> 添加父母
            </button>
            <button class="action-btn" @click="goToAdd('child')">
              <span class="emoji">⬇️</span> 添加子女
            </button>
            <button class="action-btn" @click="goToAdd('sibling')">
              <span class="emoji">⬅️</span> 添加兄弟姐妹
            </button>
            <button class="action-btn" @click="goToAdd('spouse')">
              <span class="emoji">➡️</span> 添加配偶
            </button>
          </div>
          <div class="action-footer">
            <button class="action-btn edit-btn" @click="goToEdit">
              <span class="emoji">✏️</span> 编辑
            </button>
            <button class="action-btn delete-btn" @click="deleteNode" v-if="!currentNode.isMe">
              <span class="emoji">🗑️</span> 删除
            </button>
          </div>
        </div>

        <div class="modal-body" v-if="activeTab === 'add'">
          <div class="form-group">
            <label>添加关系</label>
            <div class="relation-tag">{{ getRelationName(addForm.relation) }}</div>
          </div>

          <div class="form-group" v-if="addForm.relation === 'child' && availableSpouses.length > 0">
            <label>共同父母 (对方)</label>
            <select v-model="addForm.coParentId" class="custom-select">
              <option v-for="s in availableSpouses" :key="s.id" :value="s.id">{{ s.name }}</option>
              <option value="none">无 / 暂不指定</option>
            </select>
          </div>

          <div class="form-group" v-if="addForm.relation === 'spouse'">
            <label>婚姻状态</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="addForm.marriageStatus" value="married"> 在婚
              </label>
              <label class="radio-label">
                <input type="radio" v-model="addForm.marriageStatus" value="divorced"> 离异
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>姓名</label>
            <input type="text" v-model="addForm.name" placeholder="请输入姓名" @keyup.enter="submitAdd">
          </div>
          <div class="form-group">
            <label>性别</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="addForm.gender" value="male"> 男
              </label>
              <label class="radio-label">
                <input type="radio" v-model="addForm.gender" value="female"> 女
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>状态</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="addForm.isAlive" :value="true"> 在世
              </label>
              <label class="radio-label">
                <input type="radio" v-model="addForm.isAlive" :value="false"> 已故
              </label>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-primary" @click="submitAdd">确定添加</button>
            <button class="btn-secondary" @click="activeTab = 'actions'">返回</button>
          </div>
        </div>

        <div class="modal-body" v-if="activeTab === 'edit'">
          <div class="form-group" v-if="editForm.showMarriageStatus">
            <label>婚姻状态</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="editForm.marriageStatus" value="married"> 在婚
              </label>
              <label class="radio-label">
                <input type="radio" v-model="editForm.marriageStatus" value="divorced"> 离异
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>姓名</label>
            <input type="text" v-model="editForm.name" placeholder="请输入姓名" @keyup.enter="submitEdit">
          </div>
          <div class="form-group">
            <label>性别</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="editForm.gender" value="male"> 男
              </label>
              <label class="radio-label">
                <input type="radio" v-model="editForm.gender" value="female"> 女
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>状态</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="editForm.isAlive" :value="true"> 在世
              </label>
              <label class="radio-label">
                <input type="radio" v-model="editForm.isAlive" :value="false"> 已故
              </label>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-primary" @click="submitEdit">保存修改</button>
            <button class="btn-secondary" @click="activeTab = 'actions'">返回</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

definePageMeta({ layout: 'empty' })
useHead({ title: '现代家谱系统' })

const containerRef = ref(null)
const svgRef = ref(null)

const nodes = ref([])
const links = ref([])
const lines = ref([])
const showModal = ref(false)
const activeTab = ref('actions')
const currentNode = ref(null)
const currentPartner = ref(null)
const availableSpouses = ref([])

const addForm = reactive({
  relation: '',
  name: '',
  gender: 'male',
  isAlive: true,
  marriageStatus: 'married',
  coParentId: 'none'
})

const editForm = reactive({
  name: '',
  gender: 'male',
  isAlive: true,
  showMarriageStatus: false,
  marriageStatus: 'married'
})

const sortedGenerations = computed(() => {
  const genMap = calculateGenerations()
  const groupsByGen = {}
  const processed = new Set()
  const groups = []
  const meNode = nodes.value.find(n => n.isMe) || nodes.value[0]

  nodes.value.forEach(node => {
    if (processed.has(node.id)) return
    const gen = genMap[node.id] || 0
    const group = { primary: node, spouses: [], id: node.id, generation: gen }
    processed.add(node.id)
    
    const spouseLinks = links.value.filter(l => l.type === 'spouse' && (l.source === node.id || l.target === node.id))
    spouseLinks.forEach(l => {
      const spouseId = l.source === node.id ? l.target : l.source
      if (!processed.has(spouseId)) {
        const spouseNode = nodes.value.find(n => n.id === spouseId)
        if (spouseNode) {
          group.spouses.push(spouseNode)
          processed.add(spouseId)
        }
      }
    })
    groups.push(group)
  })

  const roleScore = {}
  if (meNode) {
    roleScore[meNode.id] = 0
    const assignScore = (nodeId, baseScore, offset, visited = new Set()) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      const parents = links.value.filter(l => l.type === 'parent' && l.target === nodeId).map(l => l.source)
      const pNodes = parents.map(id => nodes.value.find(n => n.id === id)).filter(Boolean)
      const f = pNodes.find(n => n.gender === 'male')
      const m = pNodes.find(n => n.gender === 'female')
      if (f) { roleScore[f.id] = baseScore - offset; assignScore(f.id, baseScore - offset, offset / 2, visited) }
      if (m) { roleScore[m.id] = baseScore + offset; assignScore(m.id, baseScore + offset, offset / 2, visited) }
    }
    
    const myP = links.value.filter(l => l.type === 'parent' && l.target === meNode.id).map(l => l.source)
    const myF = myP.map(id => nodes.value.find(n => n.id === id)).find(n => n && n.gender === 'male')
    const myM = myP.map(id => nodes.value.find(n => n.id === id)).find(n => n && n.gender === 'female')
    
    if (myF) { roleScore[myF.id] = -1000; assignScore(myF.id, -1000, 500) }
    if (myM) { roleScore[myM.id] = 1000; assignScore(myM.id, 1000, 500) }
  }

  groups.forEach(g => {
    const fScore = roleScore[g.primary.id]
    const sScores = g.spouses.map(s => roleScore[s.id]).filter(v => v !== undefined)
    let scores = []
    if (fScore !== undefined) scores.push(fScore)
    scores.push(...sScores)
    if (scores.length > 0) g.baseScore = scores.reduce((a, b) => a + b, 0) / scores.length
  })

  let changed = true
  let iters = 0
  while (changed && iters < 100) {
    changed = false
    iters++
    groups.forEach(g => {
      if (g.baseScore === undefined) {
        const pLinks = links.value.filter(l => l.type === 'parent' && (l.target === g.primary.id || g.spouses.some(s => s.id === l.target)))
        const pScores = pLinks.map(l => {
          const pGroup = groups.find(pg => pg.primary.id === l.source || pg.spouses.some(s => s.id === l.source))
          return pGroup && pGroup.baseScore !== undefined ? pGroup.baseScore : undefined
        }).filter(v => v !== undefined)
        
        if (pScores.length > 0) {
          let avg = pScores.reduce((a, b) => a + b, 0) / pScores.length
          
          const spouseLink = links.value.find(l => l.type === 'spouse' && (l.source === g.primary.id || l.target === g.primary.id))
          let sScore
          if (spouseLink) {
            const sId = spouseLink.source === g.primary.id ? spouseLink.target : spouseLink.source
            const sGroup = groups.find(cg => cg.primary.id === sId)
            if (sGroup && sGroup.baseScore !== undefined) sScore = sGroup.baseScore
          }

          if (sScore !== undefined) {
            g.baseScore = sScore + (g.primary.gender === 'male' ? -5 : 5)
          } else {
            g.baseScore = avg < 0 ? avg - 10 : avg + 10
          }
          
          changed = true
        } else {
          const cLinks = links.value.filter(l => l.type === 'parent' && (l.source === g.primary.id || g.spouses.some(s => s.id === l.source)))
          const cScores = cLinks.map(l => {
            const cGroup = groups.find(cg => cg.primary.id === l.target || cg.spouses.some(s => s.id === l.target))
            return cGroup && cGroup.baseScore !== undefined ? cGroup.baseScore : undefined
          }).filter(v => v !== undefined)
          
          if (cScores.length > 0) {
            let avg = cScores.reduce((a, b) => a + b, 0) / cScores.length

            const spouseLink = links.value.find(l => l.type === 'spouse' && (l.source === g.primary.id || l.target === g.primary.id))
            let sScore
            if (spouseLink) {
              const sId = spouseLink.source === g.primary.id ? spouseLink.target : spouseLink.source
              const sGroup = groups.find(cg => cg.primary.id === sId)
              if (sGroup && sGroup.baseScore !== undefined) sScore = sGroup.baseScore
            }

            if (sScore !== undefined) {
              g.baseScore = sScore + (g.primary.gender === 'male' ? -5 : 5)
            } else {
              g.baseScore = avg
            }
            
            changed = true
          }
        }
      }
    })
  }
  
  groups.forEach(g => {
    if (g.baseScore === undefined) g.baseScore = 0
    g.score = g.baseScore
  })

  groups.forEach(g => {
    if (!groupsByGen[g.generation]) groupsByGen[g.generation] = []
    groupsByGen[g.generation].push(g)
  })

  const sortedLevels = Object.keys(groupsByGen).map(Number).sort((a, b) => b - a)
  
  return sortedLevels.map(level => {
    let levelGroups = groupsByGen[level]
    
    levelGroups.forEach(g => {
      const pLinks = links.value.filter(l => l.type === 'parent' && (l.target === g.primary.id || g.spouses.some(s => s.id === l.target)))
      const pScores = pLinks.map(l => {
        const pGroup = groups.find(pg => pg.primary.id === l.source || pg.spouses.some(s => s.id === l.source))
        return pGroup ? pGroup.score : undefined
      }).filter(v => v !== undefined)
      
      if (pScores.length > 0) {
        g.score = pScores.reduce((a, b) => a + b, 0) / pScores.length
      }
    })

    levelGroups.sort((a, b) => {
      if (Math.abs(a.score - b.score) > 0.0001) return a.score - b.score
      return a.primary.id.localeCompare(b.primary.id)
    })

    let i = 0
    while (i < levelGroups.length) {
      let j = i
      while (j < levelGroups.length && Math.abs(levelGroups[j].score - levelGroups[i].score) < 0.0001) {
        j++
      }
      const count = j - i
      if (count > 1) {
        const step = 0.5
        const startScore = levelGroups[i].score - (count - 1) * step / 2
        for (let k = 0; k < count; k++) {
          levelGroups[i + k].score = startScore + k * step
        }
      }
      i = j
    }

    return { level, groups: levelGroups }
  })
})

watch([nodes, links], () => {
  saveData()
  nextTick(drawLines)
}, { deep: true })

onMounted(() => {
  loadData()
  window.addEventListener('resize', drawLines)
  setTimeout(drawLines, 300)
  setTimeout(drawLines, 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', drawLines)
})

function loadData() {
  if (import.meta.client) {
    const savedData = localStorage.getItem('familyTreeData')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      if (parsed.children || parsed.spouses) {
        nodes.value = []
        links.value = []
        parseOldTree(parsed, null)
      } else {
        nodes.value = parsed.nodes || []
        links.value = parsed.links || []
      }
    } else {
      nodes.value = [{ id: '1', name: '我', gender: 'male', isAlive: true, isMe: true }]
      links.value = []
    }
  }
}

function saveData() {
  if (import.meta.client) {
    localStorage.setItem('familyTreeData', JSON.stringify({ nodes: nodes.value, links: links.value }))
  }
}

function parseOldTree(node, parentId) {
  nodes.value.push({ id: node.id.toString(), name: node.name, gender: node.gender, isAlive: node.isAlive, isMe: node.isMe })
  if (parentId) {
    links.value.push({ id: `link_${parentId}_${node.id}`, source: parentId.toString(), target: node.id.toString(), type: 'parent' })
  }
  if (node.spouses) {
    node.spouses.forEach(spouse => {
      nodes.value.push({ id: spouse.id.toString(), name: spouse.name, gender: spouse.gender, isAlive: spouse.isAlive })
      links.value.push({ id: `link_${node.id}_${spouse.id}`, source: node.id.toString(), target: spouse.id.toString(), type: 'spouse' })
    })
  }
  if (node.children) {
    node.children.forEach(child => {
      parseOldTree(child, node.id.toString())
      if (node.spouses) {
        node.spouses.forEach(spouse => {
          links.value.push({ id: `link_${spouse.id}_${child.id}`, source: spouse.id.toString(), target: child.id.toString(), type: 'parent' })
        })
      }
    })
  }
}

function calculateGenerations() {
  const genMap = {}
  const me = nodes.value.find(n => n.isMe) || nodes.value[0]
  if (!me) return genMap
  genMap[me.id] = 0

  let changed = true
  let iterations = 0
  while (changed && iterations < 100) {
    changed = false
    iterations++
    links.value.forEach(link => {
      const { source, target, type } = link
      if (type === 'parent') {
        if (genMap[target] !== undefined && genMap[source] === undefined) {
          genMap[source] = genMap[target] + 1; changed = true
        }
        if (genMap[source] !== undefined && genMap[target] === undefined) {
          genMap[target] = genMap[source] - 1; changed = true
        }
      } else if (type === 'spouse' || type === 'sibling') {
        if (genMap[target] !== undefined && genMap[source] === undefined) {
          genMap[source] = genMap[target]; changed = true
        }
        if (genMap[source] !== undefined && genMap[target] === undefined) {
          genMap[target] = genMap[source]; changed = true
        }
      }
    })
  }

  return genMap
}

function drawLines() {
  lines.value = []
  if (!containerRef.value) return
  const container = containerRef.value.getBoundingClientRect()

  const getCenter = (id, position = 'center') => {
    const el = document.getElementById('node-' + id)
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const x = rect.left + rect.width / 2 - container.left
    let y = rect.top + rect.height / 2 - container.top
    if (position === 'bottom') y = rect.bottom - container.top
    if (position === 'top') y = rect.top - container.top
    return { x, y }
  }

  const childrenIds = [...new Set(links.value.filter(l => l.type === 'parent').map(l => l.target))]
  
  childrenIds.forEach(childId => {
    const childPt = getCenter(childId, 'top')
    if (!childPt) return

    const parentLinks = links.value.filter(l => l.type === 'parent' && l.target === childId)
    
    if (parentLinks.length === 1) {
      const pNode = nodes.value.find(n => n.id === parentLinks[0].source)
      const pPt = getCenter(parentLinks[0].source, pNode?.isDummy ? 'center' : 'bottom')
      if (pPt) {
        const midY = (pPt.y + childPt.y) / 2
        lines.value.push({ d: `M ${pPt.x} ${pPt.y} L ${pPt.x} ${midY} L ${childPt.x} ${midY} L ${childPt.x} ${childPt.y}` })
      }
    } else if (parentLinks.length >= 2) {
      const p1Node = nodes.value.find(n => n.id === parentLinks[0].source)
      const p2Node = nodes.value.find(n => n.id === parentLinks[1].source)
      const pPt1 = getCenter(parentLinks[0].source, p1Node?.isDummy ? 'center' : 'bottom')
      const pPt2 = getCenter(parentLinks[1].source, p2Node?.isDummy ? 'center' : 'bottom')
      
      if (pPt1 && pPt2) {
        const bracketY = Math.max(pPt1.y, pPt2.y) + 15
        lines.value.push({ d: `M ${pPt1.x} ${pPt1.y} L ${pPt1.x} ${bracketY} L ${pPt2.x} ${bracketY} L ${pPt2.x} ${pPt2.y}` })
        
        const bracketCenterX = (pPt1.x + pPt2.x) / 2
        const midY = (bracketY + childPt.y) / 2
        lines.value.push({ d: `M ${bracketCenterX} ${bracketY} L ${bracketCenterX} ${midY} L ${childPt.x} ${midY} L ${childPt.x} ${childPt.y}` })
      }
    }
  })
}

function openModal(node, partner = null) {
  currentNode.value = node
  currentPartner.value = partner
  activeTab.value = 'actions'
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function getModalTitle() {
  if (activeTab.value === 'actions') return `操作: ${currentNode.value.name}`
  if (activeTab.value === 'add') return `添加亲属 (相对于 ${currentNode.value.name})`
  if (activeTab.value === 'edit') return `编辑信息`
  return ''
}

function getRelationName(rel) {
  const map = { parent: '父母', child: '子女', sibling: '兄弟姐妹', spouse: '配偶' }
  return map[rel]
}

function goToAdd(relation) {
  addForm.relation = relation
  addForm.name = ''
  addForm.gender = relation === 'parent' ? 'male' : 'female'
  addForm.isAlive = true
  addForm.marriageStatus = 'married'
  
  if (relation === 'child') {
    const spouseLinks = links.value.filter(l => l.type === 'spouse' && (l.source === currentNode.value.id || l.target === currentNode.value.id))
    availableSpouses.value = spouseLinks.map(l => {
      const sId = l.source === currentNode.value.id ? l.target : l.source
      const sNode = nodes.value.find(n => n.id === sId)
      return { id: sId, name: sNode ? sNode.name : '未知' }
    })
    if (availableSpouses.value.length > 0) {
      addForm.coParentId = availableSpouses.value[0].id
    } else {
      addForm.coParentId = 'none'
    }
  }
  
  activeTab.value = 'add'
}

function goToEdit() {
  editForm.name = currentNode.value.name
  editForm.gender = currentNode.value.gender
  editForm.isAlive = currentNode.value.isAlive
  
  if (currentPartner.value) {
    const link = links.value.find(l => l.type === 'spouse' &&
      ((l.source === currentNode.value.id && l.target === currentPartner.value.id) ||
        (l.target === currentNode.value.id && l.source === currentPartner.value.id)))
    editForm.marriageStatus = link ? (link.status || 'married') : 'married'
    editForm.showMarriageStatus = true
  } else {
    editForm.showMarriageStatus = false
  }
  
  activeTab.value = 'edit'
}

function submitEdit() {
  if (!editForm.name.trim()) return alert('请输入姓名')
  currentNode.value.name = editForm.name
  currentNode.value.gender = editForm.gender
  currentNode.value.isAlive = editForm.isAlive
  
  if (editForm.showMarriageStatus && currentPartner.value) {
    const link = links.value.find(l => l.type === 'spouse' &&
      ((l.source === currentNode.value.id && l.target === currentPartner.value.id) ||
        (l.target === currentNode.value.id && l.source === currentPartner.value.id)))
    if (link) link.status = editForm.marriageStatus
  }
  
  closeModal()
}

function deleteNode() {
  if (currentNode.value.isMe) {
    alert('不能删除"我"哦！')
    return
  }
  if (!confirm(`确定要删除 ${currentNode.value.name} 吗？\n注意：删除后与其相关的连线也会断开。`)) return
  
  const id = currentNode.value.id
  links.value = links.value.filter(l => l.source !== id && l.target !== id)
  nodes.value = nodes.value.filter(n => n.id !== id)
  closeModal()
}

function submitAdd() {
  if (!addForm.name.trim()) return alert('请输入姓名')
  
  const newId = Date.now().toString()
  const newNode = {
    id: newId,
    name: addForm.name,
    gender: addForm.gender,
    isAlive: addForm.isAlive
  }
  
  const cId = currentNode.value.id

  if (addForm.relation === 'child') {
    nodes.value.push(newNode)
    links.value.push({ id: `l_${cId}_${newId}`, source: cId, target: newId, type: 'parent' })
    if (addForm.coParentId && addForm.coParentId !== 'none') {
      links.value.push({ id: `l_${addForm.coParentId}_${newId}`, source: addForm.coParentId, target: newId, type: 'parent' })
    }
  } else if (addForm.relation === 'spouse') {
    nodes.value.push(newNode)
    links.value.push({ id: `l_${cId}_${newId}`, source: cId, target: newId, type: 'spouse', status: addForm.marriageStatus || 'married' })
  } else if (addForm.relation === 'parent') {
    const parentLinks = links.value.filter(l => l.type === 'parent' && l.target === cId)
    const dummyLink = parentLinks.find(l => {
      const p = nodes.value.find(n => n.id === l.source)
      return p && p.isDummy
    })
    
    if (dummyLink) {
      const dummyNode = nodes.value.find(n => n.id === dummyLink.source)
      dummyNode.name = addForm.name
      dummyNode.gender = addForm.gender
      dummyNode.isAlive = addForm.isAlive
      dummyNode.isDummy = false
    } else {
      nodes.value.push(newNode)
      links.value.push({ id: `l_${newId}_${cId}`, source: newId, target: cId, type: 'parent' })
    }
  } else if (addForm.relation === 'sibling') {
    nodes.value.push(newNode)
    const parentLinks = links.value.filter(l => l.type === 'parent' && l.target === cId)
    if (parentLinks.length === 0) {
      const dummyId = Date.now().toString() + '_dummy'
      nodes.value.push({ id: dummyId, name: '未知', gender: 'male', isDummy: true })
      links.value.push({ id: `l_${dummyId}_${cId}`, source: dummyId, target: cId, type: 'parent' })
      links.value.push({ id: `l_${dummyId}_${newId}`, source: dummyId, target: newId, type: 'parent' })
    } else {
      parentLinks.forEach(p => {
        links.value.push({ id: `l_${p.source}_${newId}_sib`, source: p.source, target: newId, type: 'parent' })
      })
    }
  }
  
  closeModal()
}
</script>

<style scoped>
.family-tree-container {
  width: 100vw;
  height: 100vh;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #F8FAFC;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1E293B;
}

.canvas-wrapper {
  position: relative;
  min-width: max-content;
  min-height: max-content;
  padding: 60px;
}

.lines-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.tree-layout {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 70px;
}

.generation-row {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 60px;
}

.node-group {
  display: flex;
  gap: 30px;
  position: relative;
}

.node-group::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 0;
  border-top: 2px dashed #CBD5E1;
  z-index: -1;
}

.person {
  position: relative;
  padding: 16px 24px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: #FFFFFF;
  cursor: pointer;
  min-width: 70px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.person:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.person .name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 6px;
}

.person .status {
  font-size: 12px;
  color: #64748B;
  background: rgba(255, 255, 255, 0.6);
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.male {
  background: #EFF6FF;
  border-color: rgba(59, 130, 246, 0.4);
}

.male .name {
  color: #1D4ED8;
}

.female {
  background: #FDF2F8;
  border-color: rgba(236, 72, 153, 0.4);
}

.female .name {
  color: #BE185D;
}

.dead {
  filter: grayscale(100%);
  opacity: 0.75;
}

.is-me {
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
  border-color: #4F46E5;
}

.me-badge {
  position: absolute;
  top: -12px;
  right: -12px;
  background: #4F46E5;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.4);
  z-index: 10;
}

.person.dummy {
  visibility: hidden;
  width: 0;
  height: 0;
  padding: 0;
  margin: 0;
  border: 0;
  min-width: 0;
  overflow: hidden;
}

.divorced-badge {
  position: absolute;
  top: -12px;
  left: -12px;
  background: #94A3B8;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.person.divorced {
  opacity: 0.85;
  border-style: dashed;
  border-width: 2px;
}

.custom-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  font-size: 15px;
  color: #1E293B;
  background-color: #FFFFFF;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.custom-select:focus {
  border-color: #4F46E5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #FFFFFF;
  border-radius: 20px;
  width: 360px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modal-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-pop {
  0% {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.modal-header {
  background: #FFFFFF;
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #64748B;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #F43F5E;
}

.modal-body {
  padding: 24px;
  background: #F8FAFC;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.action-btn {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  padding: 16px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.action-btn:hover {
  border-color: #4F46E5;
  color: #4F46E5;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
  transform: translateY(-2px);
}

.action-btn .emoji {
  font-size: 24px;
}

.action-footer {
  margin-top: 12px;
  display: flex;
  gap: 12px;
}

.action-footer .action-btn {
  flex: 1;
  flex-direction: row;
  justify-content: center;
}

.delete-btn {
  color: #E11D48;
}

.delete-btn:hover {
  border-color: #E11D48;
  color: #BE123C;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.1);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
  color: #1E293B;
  font-size: 14px;
}

.relation-tag {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 15px;
  color: #4F46E5;
  font-weight: 600;
}

input[type="text"] {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  color: #1E293B;
}

input[type="text"]:focus {
  outline: none;
  border-color: #4F46E5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.radio-group {
  display: flex;
  gap: 12px;
}

.radio-label {
  flex: 1;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  background: #FFFFFF;
  transition: all 0.2s;
  font-size: 14px;
  color: #64748B;
}

.radio-label input {
  position: absolute;
  opacity: 0;
}

.radio-label:has(input:checked) {
  border-color: #4F46E5;
  background: rgba(79, 70, 229, 0.05);
  font-weight: 600;
  color: #4F46E5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #4F46E5;
  color: white;
}

.btn-primary:hover {
  background: #4338CA;
}

.btn-secondary {
  background: #FFFFFF;
  color: #1E293B;
  border: 1px solid #CBD5E1;
}

.btn-secondary:hover {
  background: #F1F5F9;
}
</style>

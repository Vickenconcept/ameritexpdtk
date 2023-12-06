export const factories = [
  "Pipe And Box",
  "Precast",
  "Steel",
  "Exterior",
]

export const cities = [
  "Seguin",
  "Conroe",
  "Gunter"
]

export const machineClasses = [
  "Radial Press", //RP || Pipe Machine
  "Variant", //Box Machine
  "Wire Cage (MBK)",
  //Precast
  "Blizzard",
  "Tornado",
  "Perfect System",

  "Steel",
  // Exterior
  "Fittings",
  "MISC",
]

export const classify = {
  ["Pipe And Box"]: ["Radial Press", "Variant", "Wire Cage (MBK)"],
  ["Precast"]: ["Blizzard", "Tornado", "Perfect System"],
  ["Steel"]: ["Steel"],
  ["Exterior"]: ["Fittings", "MISC"],
}

export const classifyCategory = {
    ["Radial Press and Variants"]: ["Radial Press", "Variant"],
    ["Wire Cage (MBK)"]: ["Wire Cage (MBK)"],
    ["Precast"]: ["Blizzard", "Tornado", "Perfect System"],
    ["Steel"]: ["Steel"],
    ["Fittings"]: ["Fittings"],
    ["MISC"]: ["MISC"],
}
export const mc2category = (mc) => {
  for (const f of Object.keys(classifyCategory)) {
    if (classifyCategory[f].includes(mc)) {
      return f
    }
  }
  return null
}

export const mc2factory = (mc) => {
  for (const f of factories) {
    if (classify[f].includes(mc)) {
      return f
    }
  }
  return null
}

export const factory2mc = (factory) => {
  return classify[factory]
}

export const checkMcRule = (mc, factory) => {
  if (!factory || factories.indexOf(factory) == -1) return false
  if (!mc || machineClasses.indexOf(mc) == -1) return false
  return classify[factory].includes(mc)
}

export const mcRule = {
    "Wire Cage (MBK)": "Pipe And Box",
    "Blizzard": "Precast",
    "Tornado": "Precast",
    "Perfect System": "Precast",
    "Fittings": "Exterior",
}

export const lockingTime = {
  lock: 2*60*60,
  logout: 4*60*60
}

export const offset = {
  Seguin: -5,
  Conroe: -5,
  Gunter: -5,
}

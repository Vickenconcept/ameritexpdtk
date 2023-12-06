export const roleToNumber = (v) => {
  if (!v) return -1
  if (v == "PERSONNEL") return 0
  if (v == "HR") return 1
  if (v == "admin") return 2
}
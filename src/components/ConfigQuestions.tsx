import { Gauge, Ruler, Cpu, Layers, Factory, Wallet } from 'lucide-react'

const items = [
  { icon: Gauge, title: 'Production volume', text: 'How many boards you need to build, per day or per month.' },
  { icon: Ruler, title: 'Board size and thickness', text: 'The largest and smallest boards, and their thickness range.' },
  { icon: Cpu, title: 'Component range', text: 'The smallest and largest components, and the package types you use.' },
  { icon: Layers, title: 'Single or double-sided', text: 'Whether boards are assembled on one side or both.' },
  { icon: Factory, title: 'New or existing factory', text: 'A new line, or additions to equipment you already run.' },
  { icon: Wallet, title: 'Budget', text: 'A working budget range, if you have one.' },
]

export function ConfigQuestions() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ icon: Icon, title, text }) => (
        <li key={title} className="reveal rounded-card border border-line bg-white p-6">
          <span className="grid size-11 place-items-center rounded-lg bg-accent-tint"><Icon aria-hidden className="size-6 text-accent-text" strokeWidth={1.6} /></span>
          <h3 className="mb-1.5 mt-4 text-xl font-bold text-dark-900">{title}</h3>
          <p className="text-[0.9375rem] text-muted">{text}</p>
        </li>
      ))}
    </ul>
  )
}

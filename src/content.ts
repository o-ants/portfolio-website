export type Language = 'en' | 'ru'
export const copy = {
  en: {
    name: 'Olga Antsinova', nav: ['Projects', 'About me', 'Contact'], role: 'Product Designer',
    hero: ['Complex products.', 'Clear experiences.'], intro: 'Designing digital products across consumer and B2B experiences. From the first question to the smallest interaction.', experience: '5+ years in product design', explore: 'Scroll to explore',
    selected: 'Selected projects', selectedText: 'Three products. Different challenges. A thoughtful approach to each.', other: 'Other projects', otherText: 'Smaller initiatives, considered details, and new ways to make everyday products work better.', about: 'About me', aboutTitle: ['Curious by nature.', 'Intentional by design.'], aboutText: 'I’m Olga, a product designer with 5+ years of experience. I work on consumer products, B2B platforms, and web and mobile interfaces — making complex user flows easier to navigate.', aboutSecond: 'My work connects research, product thinking, and interface design. I take a product from understanding the problem through design, testing, and iteration.', contact: 'Let’s connect.', contactText: 'Have a product challenge in mind? Let’s talk.', image: 'Project visual placeholder', imageNote: 'Real product screenshots will be added here.', soon: 'Case study in progress', preview: 'View project preview', close: 'Close preview', previous: 'Previous project', next: 'Next project', workspace: 'A little space for the person behind the work.', workspaceNote: 'Workspace illustration placeholder · Reference artwork to be added', workspaceState: 'Idle / greeting animation integration ready', back: 'Back to top', scope: ['Consumer products', 'B2B platforms', 'Web & mobile', 'End-to-end design'], details: 'Project preview', placeholder: 'This is a layout placeholder, not the final product interface. The full case study is being prepared.', linked: 'Link coming soon', rail: 'Scroll or swipe to explore', years: 'Years of experience',
  },
  ru: {
    name: 'Ольга Анцинова', nav: ['Проекты', 'Обо мне', 'Контакты'], role: 'Продуктовый дизайнер',
    hero: ['Сложные продукты.', 'Понятный опыт.'], intro: 'Проектирую цифровые продукты для пользователей и бизнеса. От первого вопроса до мельчайших деталей взаимодействия.', experience: '5+ лет в продуктовом дизайне', explore: 'Листайте, чтобы узнать больше',
    selected: 'Избранные проекты', selectedText: 'Три продукта. Разные задачи. Вдумчивый подход к каждому.', other: 'Другие проекты', otherText: 'Небольшие инициативы, продуманные детали и новые способы сделать повседневные продукты удобнее.', about: 'Обо мне', aboutTitle: ['Любопытство — в характере.', 'Осознанность — в дизайне.'], aboutText: 'Я Ольга, продуктовый дизайнер с опытом более 5 лет. Работаю с потребительскими продуктами, B2B-платформами, веб- и мобильными интерфейсами — делаю сложные пользовательские сценарии понятнее.', aboutSecond: 'Соединяю исследования, продуктовое мышление и дизайн интерфейсов. Веду продукт от понимания проблемы до проектирования, тестирования и итераций.', contact: 'Давайте знакомиться.', contactText: 'Есть продуктовая задача? Давайте обсудим.', image: 'Место для изображения проекта', imageNote: 'Здесь появятся реальные скриншоты продукта.', soon: 'Кейс готовится', preview: 'Посмотреть проект', close: 'Закрыть', previous: 'Предыдущий проект', next: 'Следующий проект', workspace: 'Немного о человеке за проектами.', workspaceNote: 'Место для иллюстрации · Добавим по референсам', workspaceState: 'Подготовлены состояния работы и приветствия', back: 'Наверх', scope: ['Потребительские продукты', 'B2B-платформы', 'Веб и мобильные интерфейсы', 'Полный цикл дизайна'], details: 'Предпросмотр проекта', placeholder: 'Это заглушка для проверки композиции, а не финальный интерфейс продукта. Полный кейс готовится.', linked: 'Ссылка появится позже', rail: 'Листайте или используйте кнопки', years: 'Лет опыта',
  },
}
export const projects = [
  { title: 'PP Assistant', mark: 'pp', theme: 'sage', type: 'Consumer · Mobile', en: 'Personalized nutrition product', ru: 'Продукт персонализированного питания' },
  { title: 'X5 Blogger Platform', mark: 'X5', theme: 'lilac', type: 'B2B · Web', en: 'A platform for creators and advertisers', ru: 'Платформа для авторов и рекламодателей' },
  { title: 'Food.ru', mark: 'food.ru', theme: 'peach', type: 'Consumer · Web & Mobile', en: 'A consumer product and recipe ecosystem', ru: 'Потребительский продукт и экосистема рецептов' },
]
export const otherProjects = [
  { title: 'Random Recipe', group: 'Food.ru', theme: 'sage', mark: '↻' },
  { title: 'Clear Recipes', group: 'Food.ru', theme: 'peach', mark: 'Aa' },
  { title: 'Deliver Heavy', group: 'Product initiative', theme: 'lilac', mark: '↓' },
  { title: 'CMS 2.0', group: 'Content management', theme: 'sand', mark: '2.0' },
  { title: 'Food.ru chatbot', group: 'Food.ru', theme: 'blue', mark: '…' },
]

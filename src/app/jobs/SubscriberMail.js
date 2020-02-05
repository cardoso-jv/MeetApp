import Mail from '../../lib/Mail';

class SubscriberMail {
  get key() {
    return 'SubscriberMails';
  }


  async handle({ data }) {
    const { meetup } = data;

    console.log('A fila executou');
    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: 'Uma nova inscrição foi feita',
      template: 'subscriber',
      context: {
        organizer: meetup.User.name,
        subscriber: meetup.User.name, // mudar para o nome do subscriber e n organizer;
        title: meetup.title,
      },
    });
  }
}

export default new SubscriberMail();

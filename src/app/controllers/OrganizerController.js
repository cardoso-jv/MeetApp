import Meetup from '../models/Meetup';

class OrganizerController {
  async index(req, res) {
    const meetups = await Meetup.findAll({ where: { id_user: req.userId } });

    return res.json(meetups);
  }
}

export default new OrganizerController();

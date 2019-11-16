import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
// Definido como classe
class AvailableController {
  // Inserir metodo index
  async index(req, res) {
    // Pega o date do re.query (pagina)
    const { date } = req.query;
    // Verificar se não existe o date
    if (!date) {
      // Retorna mensagem de erro
      return res.status(400).json({ error: 'Invalid date' });
    }
    // Se existir a data, garantir que a mesma esteja em numero inteiro
    const searchDate = Number(date);
    // Buscar os agendamentos da data
    const appointments = await Appointment.findAll({
      // Filtros
      where: {
        // Provider_id é aquele que esta na routes, chega atraves da url
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ];

    const available = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available:
          isAfter(value, new Date()) &&
          !appointments.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json(available);
  }
}
// Export padrão
export default new AvailableController();

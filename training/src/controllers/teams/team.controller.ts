import { Body, ListRepresenter, Representer } from "@panenco/papi";
import { Authorized, Delete, Get, JsonController, Param, Patch, Post, Req } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { TeamBody } from "../../contracts/bodies/team.body";
import { TenderBody } from "../../contracts/bodies/tender.body";
import { TeamView } from "../../contracts/views/team.view";
import { TenderView } from "../../contracts/views/tender.view";
import { createTeam } from "./handlers/createTeam.handler";
import { createTender } from "./handlers/createTender.handler";
import { deleteTeam } from "./handlers/deleteTeam.handler";
import { getTeam } from "./handlers/getTeam.handler";
import { getTeams } from "./handlers/getTeams.handler";
import { getTenders } from "./handlers/getTenders.handler";
import { updateTeam } from "./handlers/updateTeam.handler";

@JsonController('/teams')
@Authorized()
export class TeamController {
  @Post()
  @OpenAPI({ summary: 'Create team for current user' })
  @Representer(TeamView)
  async createTeam(@Body() body: TeamBody, @Req() { token: { userId } }: any) {
    return createTeam(body, userId)
  }

  @Get()
  @OpenAPI({ summary: 'Get teams list of current user' })
  @ListRepresenter(TeamView)
  async getTeams(@Req() { token: { userId } }: any) {
    return getTeams(userId)
  }

  @Get('/:id')
  @OpenAPI({ summary: 'Get team' })
  @Representer(TeamView)
  async getTeam(@Param("id") id: string) {
    return getTeam(id)
  }

  @Patch('/:id')
  @OpenAPI({ summary: 'Update team' })
  @Representer(TeamView)
  async updateTeam(@Param("id") id: string, @Body({}, { skipMissingProperties: true }) body: TeamBody) {
    return updateTeam(id, body);
  }

  @Delete('/:id')
  @Representer(null, 204)
  async deleteTeam(@Param("id") id: string) {
    return deleteTeam(id);
  }

  @Post('/:id/tenders')
  @OpenAPI({ summary: 'Create tender' })
  @Representer(TenderView)
  async createTender (@Param("id") id: string, @Body() tenderBody: TenderBody) {
    return createTender(tenderBody, id);
  }

  @Get('/:id/tenders')
  @OpenAPI({ summary: 'Get team tenders' })
  @ListRepresenter(TenderView)
  async getTenders (@Param("id") id: string) {
    return getTenders(id);
  }
}